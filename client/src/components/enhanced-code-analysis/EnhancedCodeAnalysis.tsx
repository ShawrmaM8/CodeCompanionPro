import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Code, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Star,
  TrendingUp,
  Shield,
  Zap,
  Brain,
  Target,
  BookOpen
} from 'lucide-react';

interface EnhancedAnalysisResult {
  overallScore: number;
  bestPractices: number;
  performance: number;
  maintainability: number;
  security: number;
  issues: Array<{
    type: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    line?: number;
    suggestion?: string;
  }>;
  strengths: string[];
  improvements: string[];
  // Enhanced AI fields
  aiSummary?: string;
  skillTags?: string[];
  complexity?: 'beginner' | 'intermediate' | 'advanced';
  confidence?: number;
  suggestions?: string[];
}

interface EnhancedCodeAnalysisProps {
  code: string;
  fileName?: string;
  onAnalysisComplete?: (result: EnhancedAnalysisResult) => void;
}

const EnhancedCodeAnalysis: React.FC<EnhancedCodeAnalysisProps> = ({
  code,
  fileName,
  onAnalysisComplete
}) => {
  const [analysis, setAnalysis] = useState<EnhancedAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (code) {
      analyzeCode();
    }
  }, [code]);

  const analyzeCode = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/code-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('clerk_token')}`
        },
        body: JSON.stringify({
          code,
          fileName,
          projectId: null
        })
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysis(result.analysisResults);
        onAnalysisComplete?.(result.analysisResults);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  const getComplexityColor = (complexity?: string) => {
    switch (complexity) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Analyzing your code...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Code className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No analysis available. Upload some code to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                  {analysis.overallScore}%
                </p>
              </div>
              {getScoreIcon(analysis.overallScore)}
            </div>
            <Progress value={analysis.overallScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Best Practices</p>
                <p className={`text-2xl font-bold ${getScoreColor(analysis.bestPractices)}`}>
                  {analysis.bestPractices}%
                </p>
              </div>
              <Star className="h-5 w-5 text-blue-600" />
            </div>
            <Progress value={analysis.bestPractices} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance</p>
                <p className={`text-2xl font-bold ${getScoreColor(analysis.performance)}`}>
                  {analysis.performance}%
                </p>
              </div>
              <Zap className="h-5 w-5 text-yellow-600" />
            </div>
            <Progress value={analysis.performance} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security</p>
                <p className={`text-2xl font-bold ${getScoreColor(analysis.security)}`}>
                  {analysis.security}%
                </p>
              </div>
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <Progress value={analysis.security} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* AI Summary */}
      {analysis.aiSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{analysis.aiSummary}</p>
            {analysis.confidence && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-600">Confidence:</span>
                <Badge variant="outline">
                  {Math.round(analysis.confidence * 100)}%
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Improvements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Improvements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.issues.map((issue, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      {issue.severity === 'error' && <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />}
                      {issue.severity === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />}
                      {issue.severity === 'info' && <Info className="h-5 w-5 text-blue-500 mt-0.5" />}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={issue.severity === 'error' ? 'destructive' : issue.severity === 'warning' ? 'secondary' : 'outline'}>
                            {issue.severity}
                          </Badge>
                          <span className="text-sm font-medium">{issue.type}</span>
                          {issue.line && (
                            <span className="text-sm text-gray-500">Line {issue.line}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{issue.message}</p>
                        {issue.suggestion && (
                          <div className="p-2 bg-blue-50 rounded text-sm">
                            <strong>Suggestion:</strong> {issue.suggestion}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Detected Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.skillTags && analysis.skillTags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Skills Detected</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skillTags.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {analysis.complexity && (
                  <div>
                    <h4 className="font-medium mb-2">Code Complexity</h4>
                    <Badge className={getComplexityColor(analysis.complexity)}>
                      {analysis.complexity.charAt(0).toUpperCase() + analysis.complexity.slice(1)}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.suggestions && analysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedCodeAnalysis;
