import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Code, FileText } from "lucide-react";
import { AnalysisEngine } from "./analysis-engine";
import { useProjects } from "@/hooks/use-projects";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CodeUpload() {
  const [code, setCode] = useState("");
  const [fileName, setFileName] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const { data: projects } = useProjects();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
        setFileName(file.name);
      };
      reader.readAsText(file);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
        setFileName(file.name);
      };
      reader.readAsText(file);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const sampleCodes = {
    javascript: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// This could be optimized with memoization
console.log(fibonacci(10));`,
    python: `def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)

# Good: Clear function name and logic
print(factorial(5))`,
    react: `import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default Counter;`,
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" data-testid="tab-upload">
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="paste" data-testid="tab-paste">
            <Code className="w-4 h-4 mr-2" />
            Paste Code
          </TabsTrigger>
          <TabsTrigger value="samples" data-testid="tab-samples">
            <FileText className="w-4 h-4 mr-2" />
            Try Samples
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Code File</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Project Selection */}
              {projects && projects.length > 0 && (
                <div>
                  <Label htmlFor="project">Associate with Project (Optional)</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger data-testid="select-project">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* File Upload Area */}
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                data-testid="drop-zone"
              >
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Drag and drop a code file here</p>
                  <p className="text-xs text-muted-foreground">
                    Supports .js, .ts, .py, .java, .cpp, .cs, and more
                  </p>
                  <div className="flex items-center justify-center">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <Button variant="outline" className="mt-2" data-testid="button-choose-file">
                        Choose File
                      </Button>
                      <Input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt"
                        onChange={handleFileUpload}
                      />
                    </Label>
                  </div>
                </div>
              </div>

              {fileName && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Selected File:</p>
                  <p className="text-sm text-muted-foreground" data-testid="text-selected-file">
                    {fileName}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paste" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paste Your Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Project Selection */}
              {projects && projects.length > 0 && (
                <div>
                  <Label htmlFor="project-paste">Associate with Project (Optional)</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger data-testid="select-project-paste">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="filename">File Name (Optional)</Label>
                <Input
                  id="filename"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g., component.tsx, utils.js"
                  data-testid="input-filename"
                />
              </div>

              <div>
                <Label htmlFor="code-textarea">Code</Label>
                <Textarea
                  id="code-textarea"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  className="min-h-[300px] font-mono"
                  data-testid="textarea-code"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="samples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Try Sample Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(sampleCodes).map(([language, sampleCode]) => (
                  <Button
                    key={language}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => {
                      setCode(sampleCode);
                      setFileName(`sample.${language === 'javascript' ? 'js' : language === 'react' ? 'jsx' : language}`);
                    }}
                    data-testid={`button-sample-${language}`}
                  >
                    <div className="font-medium capitalize">{language}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {language === 'javascript' && 'Fibonacci function with recursion'}
                      {language === 'python' && 'Factorial function implementation'}
                      {language === 'react' && 'Simple counter component'}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Analysis Engine */}
      <AnalysisEngine code={code} fileName={fileName} projectId={selectedProject} />
    </div>
  );
}
