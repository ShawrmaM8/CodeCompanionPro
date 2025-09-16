import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export function AnalysisSummary() {
  const { data: analysisHistory } = useQuery({
    queryKey: ["/api/code-analysis/history"],
    select: (data) => data?.[0], // Get most recent analysis
  });

  const analysisData = analysisHistory?.analysisResults || {
    overallScore: 87,
    bestPractices: 92,
    performance: 85,
    maintainability: 78,
    security: 94,
  };

  const scoreCategories = [
    { name: "Best Practices", score: analysisData.bestPractices, color: "accent" },
    { name: "Performance", score: analysisData.performance, color: "primary" },
    { name: "Maintainability", score: analysisData.maintainability, color: "secondary" },
    { name: "Security", score: analysisData.security, color: "muted" },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Code Analysis</CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Overall Score Circle */}
        <div className="relative mb-6">
          <div className="flex items-center justify-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 progress-ring" viewBox="0 0 36 36">
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
                  strokeDasharray={`${analysisData.overallScore}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground" data-testid="text-overall-score">
                  {analysisData.overallScore}%
                </span>
              </div>
            </div>
          </div>
          <p className="text-center text-muted-foreground text-sm mt-2">Overall Code Quality</p>
        </div>
        
        {/* Breakdown */}
        <div className="space-y-3">
          {scoreCategories.map((category) => (
            <div key={category.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 bg-${category.color} rounded-full`} />
                <span className="text-sm text-foreground">{category.name}</span>
              </div>
              <span className="text-sm font-medium text-foreground" data-testid={`score-${category.name.toLowerCase()}`}>
                {category.score}%
              </span>
            </div>
          ))}
        </div>
        
        <Link href="/analysis">
          <Button 
            className="w-full mt-4 bg-primary hover:bg-primary/90"
            data-testid="button-detailed-analysis"
          >
            View Detailed Analysis
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
