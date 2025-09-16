import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CodeAnalysis } from "@shared/schema";

interface AnalysisEngineProps {
  code?: string;
  fileName?: string;
  projectId?: string;
}

export function AnalysisEngine({ code, fileName, projectId }: AnalysisEngineProps) {
  const [analysisResult, setAnalysisResult] = useState<CodeAnalysis | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const analyzeCodeMutation = useMutation({
    mutationFn: async (data: { code: string; fileName?: string; projectId?: string }) => {
      const response = await apiRequest("POST", "/api/code-analysis", data);
      return await response.json();
    },
    onSuccess: (result) => {
      setAnalysisResult(result);
      queryClient.invalidateQueries({ queryKey: ["/api/code-analysis/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Analysis Complete",
        description: `Code quality score: ${result.analysisResults.overallScore}%`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!code) {
      toast({
        title: "No Code to Analyze",
        description: "Please upload or paste some code first.",
        variant: "destructive",
      });
      return;
    }
    analyzeCodeMutation.mutate({ code, fileName, projectId });
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-secondary" />;
      case "info":
        return <Info className="w-4 h-4 text-primary" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "destructive";
      case "warning":
        return "secondary";
      case "info":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Analysis Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Code Analysis Engine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {fileName ? `Analyzing: ${fileName}` : "Ready to analyze code"}
              </p>
              {code && (
                <p className="text-xs text-muted-foreground mt-1">
                  {code.split('\n').length} lines, {code.length} characters
                </p>
              )}
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={analyzeCodeMutation.isPending || !code}
              data-testid="button-analyze-code"
            >
              {analyzeCodeMutation.isPending ? "Analyzing..." : "Analyze Code"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 progress-ring" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="hsl(var(--accent))"
                        strokeWidth="3"
                        strokeDasharray={`${analysisResult.analysisResults.overallScore}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-foreground" data-testid="text-overall-score">
                        {analysisResult.analysisResults.overallScore}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Best Practices</span>
                      <span className="font-medium" data-testid="score-best-practices">
                        {analysisResult.analysisResults.bestPractices}%
                      </span>
                    </div>
                    <Progress value={analysisResult.analysisResults.bestPractices} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Performance</span>
                      <span className="font-medium" data-testid="score-performance">
                        {analysisResult.analysisResults.performance}%
                      </span>
                    </div>
                    <Progress value={analysisResult.analysisResults.performance} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Maintainability</span>
                      <span className="font-medium" data-testid="score-maintainability">
                        {analysisResult.analysisResults.maintainability}%
                      </span>
                    </div>
                    <Progress value={analysisResult.analysisResults.maintainability} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Security</span>
                      <span className="font-medium" data-testid="score-security">
                        {analysisResult.analysisResults.security}%
                      </span>
                    </div>
                    <Progress value={analysisResult.analysisResults.security} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues */}
          {analysisResult.analysisResults.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Issues Found ({analysisResult.analysisResults.issues.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisResult.analysisResults.issues.map((issue, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 border rounded-lg"
                      data-testid={`issue-${index}`}
                    >
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{issue.type}</span>
                          <Badge variant={getSeverityColor(issue.severity) as any} className="text-xs">
                            {issue.severity}
                          </Badge>
                          {issue.line && (
                            <span className="text-xs text-muted-foreground">Line {issue.line}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{issue.message}</p>
                        {issue.suggestion && (
                          <p className="text-sm text-accent mt-1">💡 {issue.suggestion}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strengths and Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>Strengths</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysisResult.analysisResults.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center space-x-2" data-testid={`strength-${index}`}>
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span className="text-sm">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Improvements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-secondary" />
                  <span>Improvements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysisResult.analysisResults.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-center space-x-2" data-testid={`improvement-${index}`}>
                      <AlertTriangle className="w-4 h-4 text-secondary" />
                      <span className="text-sm">{improvement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
