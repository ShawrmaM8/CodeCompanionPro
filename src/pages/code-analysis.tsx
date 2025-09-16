import { Layout } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AnalysisEngine } from "@/components/code-analysis/analysis-engine";
import { CodeUpload } from "@/components/code-analysis/code-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";

export default function CodeAnalysis() {
  const { data: analysisHistory } = useQuery({
    queryKey: ["/api/code-analysis/history"],
  });

  return (
    <Layout>
      <main className="flex-1 overflow-auto">
        <Header 
          title="Code Analysis" 
          subtitle="Analyze your code for quality, performance, and best practices" 
        />
        
        <div className="p-6">
          <Tabs defaultValue="analyze" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="analyze" data-testid="tab-analyze">
                Analyze Code
              </TabsTrigger>
              <TabsTrigger value="history" data-testid="tab-history">
                Analysis History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="analyze" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Code for Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <CodeUpload />
                </CardContent>
              </Card>
              
              <AnalysisEngine />
            </TabsContent>
            
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Analysis Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisHistory && analysisHistory.length > 0 ? (
                    <div className="space-y-4">
                      {analysisHistory.map((analysis: any) => (
                        <div 
                          key={analysis.id} 
                          className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                          data-testid={`analysis-result-${analysis.id}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">
                              {analysis.fileName || 'Code Analysis'}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">
                                Score: {analysis.analysisResults.overallScore}%
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(analysis.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Best Practices: </span>
                              <span className="font-medium">
                                {analysis.analysisResults.bestPractices}%
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Performance: </span>
                              <span className="font-medium">
                                {analysis.analysisResults.performance}%
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Maintainability: </span>
                              <span className="font-medium">
                                {analysis.analysisResults.maintainability}%
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Security: </span>
                              <span className="font-medium">
                                {analysis.analysisResults.security}%
                              </span>
                            </div>
                          </div>
                          
                          {analysis.analysisResults.issues.length > 0 && (
                            <div className="mt-3">
                              <span className="text-sm text-muted-foreground">
                                Issues: {analysis.analysisResults.issues.length}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No analysis history found. Start by analyzing some code!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </Layout>
  );
}
