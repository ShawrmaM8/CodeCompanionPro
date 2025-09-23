import { CodeAnalysisEngine } from "../../client/src/lib/code-analysis-engine";

export interface AnalysisResult {
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
}

class CodeAnalysisService {
  private engine = new CodeAnalysisEngine();

  async analyzeCode(code: string, fileName?: string): Promise<AnalysisResult> {
    try {
      // Use the client-side analysis engine
      const result = this.engine.analyzeCode(code, fileName);
      
      // Add server-side enhancements
      await this.enhanceAnalysis(result, code, fileName);
      
      return result;
    } catch (error) {
      console.error('Code analysis failed:', error);
      throw new Error('Code analysis failed');
    }
  }

  private async enhanceAnalysis(result: AnalysisResult, code: string, fileName?: string): Promise<void> {
    // Add language-specific analysis
    const language = this.detectLanguage(code, fileName);
    
    switch (language) {
      case 'javascript':
      case 'typescript':
        this.enhanceJavaScriptAnalysis(result, code);
        break;
      case 'python':
        this.enhancePythonAnalysis(result, code);
        break;
      case 'java':
        this.enhanceJavaAnalysis(result, code);
        break;
    }

    // Add complexity analysis
    this.addComplexityAnalysis(result, code);
    
    // Add maintainability insights
    this.addMaintainabilityInsights(result, code);
  }

  private detectLanguage(code: string, fileName?: string): string {
    if (fileName) {
      const ext = fileName.split('.').pop()?.toLowerCase();
      const extensionMap: { [key: string]: string } = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'cs': 'csharp',
        'php': 'php',
        'rb': 'ruby',
        'go': 'go',
        'rs': 'rust',
        'swift': 'swift',
        'kt': 'kotlin',
      };
      
      if (ext && extensionMap[ext]) {
        return extensionMap[ext];
      }
    }

    // Detect by content
    if (code.includes('function ') || code.includes('const ') || code.includes('let ')) {
      return code.includes('interface ') || code.includes(': string') ? 'typescript' : 'javascript';
    }
    
    if (code.includes('def ') || code.includes('import ') && code.includes('from ')) {
      return 'python';
    }
    
    if (code.includes('public class ') || code.includes('private ') || code.includes('System.out')) {
      return 'java';
    }

    return 'unknown';
  }

  private enhanceJavaScriptAnalysis(result: AnalysisResult, code: string): void {
    // Check for modern JavaScript features
    if (code.includes('const ') && code.includes('arrow functions')) {
      result.strengths.push('Uses modern ES6+ features');
    }

    // Check for common React patterns
    if (code.includes('useState') || code.includes('useEffect')) {
      result.strengths.push('Proper React hooks usage');
    }

    // Check for async/await patterns
    if (code.includes('async ') && code.includes('await ')) {
      result.strengths.push('Modern asynchronous programming');
    }

    // Check for potential issues
    if (code.includes('document.getElementById')) {
      result.improvements.push('Consider using React refs or modern DOM selection methods');
    }

    if (code.includes('var ')) {
      result.improvements.push('Replace var with const or let for better scoping');
    }
  }

  private enhancePythonAnalysis(result: AnalysisResult, code: string): void {
    // Check for Python best practices
    if (code.includes('if __name__ == "__main__":')) {
      result.strengths.push('Proper Python script structure');
    }

    if (code.match(/"""[\s\S]*?"""/)) {
      result.strengths.push('Good documentation with docstrings');
    }

    // Check for list comprehensions
    if (code.includes('[') && code.includes('for ') && code.includes(' in ')) {
      result.strengths.push('Efficient use of list comprehensions');
    }

    // Check for potential improvements
    if (code.includes('range(len(')) {
      result.improvements.push('Consider using enumerate() instead of range(len())');
    }
  }

  private enhanceJavaAnalysis(result: AnalysisResult, code: string): void {
    // Check for Java best practices
    if (code.includes('public static void main')) {
      result.strengths.push('Proper Java entry point');
    }

    if (code.includes('@Override')) {
      result.strengths.push('Good use of annotations');
    }

    // Check for potential issues
    if (code.includes('System.out.println') && !code.includes('logger')) {
      result.improvements.push('Consider using a logging framework instead of System.out');
    }
  }

  private addComplexityAnalysis(result: AnalysisResult, code: string): void {
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(code);
    
    if (cyclomaticComplexity > 10) {
      result.issues.push({
        type: 'Complexity',
        severity: 'warning',
        message: `High cyclomatic complexity (${cyclomaticComplexity}). Consider breaking down complex functions.`,
        suggestion: 'Split complex functions into smaller, more focused functions',
      });
      result.maintainability -= 10;
    }

    if (lines.length > 100) {
      result.improvements.push('Consider breaking down large files into smaller modules');
    }
  }

  private calculateCyclomaticComplexity(code: string): number {
    // Simple cyclomatic complexity calculation
    const complexityKeywords = [
      'if', 'else if', 'while', 'for', 'switch', 'case', 'catch', '&&', '||', '?'
    ];
    
    let complexity = 1; // Base complexity
    
    complexityKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = code.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  private addMaintainabilityInsights(result: AnalysisResult, code: string): void {
    const lines = code.split('\n');
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('/*') || 
      line.trim().startsWith('*') ||
      line.trim().startsWith('#')
    );

    const commentRatio = commentLines.length / lines.length;
    
    if (commentRatio > 0.1) {
      result.strengths.push('Well-documented code');
    } else if (commentRatio < 0.05) {
      result.improvements.push('Add more comments to explain complex logic');
    }

    // Check for long functions
    const functionMatches = code.match(/function\s+\w+[^{]*{[^}]*}/g) || [];
    const longFunctions = functionMatches.filter(func => func.split('\n').length > 20);
    
    if (longFunctions.length > 0) {
      result.improvements.push('Some functions are quite long - consider breaking them down');
    }

    // Check for magic numbers
    const magicNumbers = code.match(/\b\d{2,}\b/g) || [];
    if (magicNumbers.length > 3) {
      result.improvements.push('Consider using named constants instead of magic numbers');
    }
  }

  async analyzeProject(projectFiles: Array<{ name: string; content: string }>): Promise<AnalysisResult> {
    const results: AnalysisResult[] = [];
    
    for (const file of projectFiles) {
      const result = await this.analyzeCode(file.content, file.name);
      results.push(result);
    }

    // Aggregate results
    return this.aggregateResults(results);
  }

  private aggregateResults(results: AnalysisResult[]): AnalysisResult {
    if (results.length === 0) {
      throw new Error('No results to aggregate');
    }

    const aggregated: AnalysisResult = {
      overallScore: 0,
      bestPractices: 0,
      performance: 0,
      maintainability: 0,
      security: 0,
      issues: [],
      strengths: [],
      improvements: [],
    };

    // Calculate averages
    aggregated.overallScore = Math.round(
      results.reduce((sum, r) => sum + r.overallScore, 0) / results.length
    );
    aggregated.bestPractices = Math.round(
      results.reduce((sum, r) => sum + r.bestPractices, 0) / results.length
    );
    aggregated.performance = Math.round(
      results.reduce((sum, r) => sum + r.performance, 0) / results.length
    );
    aggregated.maintainability = Math.round(
      results.reduce((sum, r) => sum + r.maintainability, 0) / results.length
    );
    aggregated.security = Math.round(
      results.reduce((sum, r) => sum + r.security, 0) / results.length
    );

    // Combine issues (limit to top 10)
    const allIssues = results.flatMap(r => r.issues);
    aggregated.issues = allIssues
      .sort((a, b) => {
        const severityOrder = { error: 3, warning: 2, info: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
      .slice(0, 10);

    // Combine unique strengths and improvements
    aggregated.strengths = [...new Set(results.flatMap(r => r.strengths))].slice(0, 5);
    aggregated.improvements = [...new Set(results.flatMap(r => r.improvements))].slice(0, 5);

    return aggregated;
  }
}

export const codeAnalysisService = new CodeAnalysisService();
