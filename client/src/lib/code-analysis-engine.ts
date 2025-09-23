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

export class CodeAnalysisEngine {
  private patterns = {
    // Security patterns
    security: [
      {
        pattern: /eval\s*\(/g,
        severity: 'error' as const,
        message: 'Use of eval() is dangerous and should be avoided',
        suggestion: 'Use JSON.parse() for parsing JSON or other safe alternatives',
      },
      {
        pattern: /innerHTML\s*=/g,
        severity: 'warning' as const,
        message: 'innerHTML can lead to XSS vulnerabilities',
        suggestion: 'Use textContent, createElement, or sanitize HTML content',
      },
      {
        pattern: /document\.write\s*\(/g,
        severity: 'warning' as const,
        message: 'document.write() can be dangerous and affect performance',
        suggestion: 'Use DOM manipulation methods instead',
      },
    ],

    // Performance patterns
    performance: [
      {
        pattern: /for\s*\(\s*var\s+\w+\s*=\s*0\s*;\s*\w+\s*<\s*\w+\.length\s*;\s*\w+\+\+\s*\)/g,
        severity: 'info' as const,
        message: 'Consider caching array length in loops',
        suggestion: 'Cache array.length in a variable before the loop',
      },
      {
        pattern: /querySelector(?:All)?\s*\(\s*['"]/g,
        severity: 'info' as const,
        message: 'Multiple DOM queries can impact performance',
        suggestion: 'Cache DOM elements in variables when used multiple times',
      },
    ],

    // Best practices patterns
    bestPractices: [
      {
        pattern: /var\s+/g,
        severity: 'warning' as const,
        message: 'Use const or let instead of var',
        suggestion: 'const for values that never change, let for variables that change',
      },
      {
        pattern: /==\s*[^=]/g,
        severity: 'warning' as const,
        message: 'Use strict equality (===) instead of loose equality (==)',
        suggestion: 'Replace == with === for type-safe comparisons',
      },
      {
        pattern: /console\.log\s*\(/g,
        severity: 'info' as const,
        message: 'Remove console.log statements in production code',
        suggestion: 'Use a proper logging library or remove debug statements',
      },
    ],

    // Maintainability patterns
    maintainability: [
      {
        pattern: /function\s+\w+\s*\([^)]*\)\s*{[^}]{200,}/g,
        severity: 'warning' as const,
        message: 'Function appears to be too long',
        suggestion: 'Consider breaking down into smaller, focused functions',
      },
      {
        pattern: /\/\*[\s\S]*?\*\/|\/\/.+$/gm,
        severity: 'info' as const,
        message: 'Good use of comments for documentation',
        suggestion: null,
        isPositive: true,
      },
    ],
  };

  analyzeCode(code: string, fileName?: string): AnalysisResult {
    const issues: AnalysisResult['issues'] = [];
    const strengths: string[] = [];
    const improvements: string[] = [];

    let securityScore = 100;
    let performanceScore = 100;
    let bestPracticesScore = 100;
    let maintainabilityScore = 100;

    const lines = code.split('\n');

    // Analyze security
    this.patterns.security.forEach(pattern => {
      const matches = code.match(pattern.pattern);
      if (matches) {
        matches.forEach(match => {
          const lineIndex = this.findLineNumber(code, match);
          issues.push({
            type: 'Security',
            severity: pattern.severity,
            message: pattern.message,
            line: lineIndex + 1,
            suggestion: pattern.suggestion,
          });
          securityScore -= pattern.severity === 'error' ? 20 : 10;
        });
      }
    });

    // Analyze performance
    this.patterns.performance.forEach(pattern => {
      const matches = code.match(pattern.pattern);
      if (matches) {
        matches.forEach(match => {
          const lineIndex = this.findLineNumber(code, match);
          issues.push({
            type: 'Performance',
            severity: pattern.severity,
            message: pattern.message,
            line: lineIndex + 1,
            suggestion: pattern.suggestion,
          });
          performanceScore -= 5;
        });
      }
    });

    // Analyze best practices
    this.patterns.bestPractices.forEach(pattern => {
      const matches = code.match(pattern.pattern);
      if (matches) {
        matches.forEach(match => {
          const lineIndex = this.findLineNumber(code, match);
          if (pattern.severity !== 'info' || !('isPositive' in pattern)) {
            issues.push({
              type: 'Best Practice',
              severity: pattern.severity,
              message: pattern.message,
              line: lineIndex + 1,
              suggestion: pattern.suggestion,
            });
            bestPracticesScore -= pattern.severity === 'error' ? 15 : 5;
          }
        });
      }
    });

    // Analyze maintainability
    this.patterns.maintainability.forEach(pattern => {
      const matches = code.match(pattern.pattern);
      if (matches) {
        matches.forEach(match => {
          const lineIndex = this.findLineNumber(code, match);
          if ('isPositive' in pattern && pattern.isPositive) {
            strengths.push(pattern.message);
          } else {
            issues.push({
              type: 'Maintainability',
              severity: pattern.severity,
              message: pattern.message,
              line: lineIndex + 1,
              suggestion: pattern.suggestion,
            });
            maintainabilityScore -= 10;
          }
        });
      }
    });

    // Add positive patterns
    this.checkPositivePatterns(code, strengths);

    // Add improvement suggestions
    this.generateImprovements(code, improvements);

    // Ensure scores don't go below 0
    securityScore = Math.max(0, securityScore);
    performanceScore = Math.max(0, performanceScore);
    bestPracticesScore = Math.max(0, bestPracticesScore);
    maintainabilityScore = Math.max(0, maintainabilityScore);

    const overallScore = Math.round(
      (securityScore + performanceScore + bestPracticesScore + maintainabilityScore) / 4
    );

    return {
      overallScore,
      bestPractices: Math.round(bestPracticesScore),
      performance: Math.round(performanceScore),
      maintainability: Math.round(maintainabilityScore),
      security: Math.round(securityScore),
      issues,
      strengths,
      improvements,
    };
  }

  private findLineNumber(code: string, searchString: string): number {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchString)) {
        return i;
      }
    }
    return 0;
  }

  private checkPositivePatterns(code: string, strengths: string[]) {
    // Check for good patterns
    if (code.includes('const ') || code.includes('let ')) {
      strengths.push('Good use of modern variable declarations');
    }

    if (code.includes('async ') && code.includes('await ')) {
      strengths.push('Proper async/await usage');
    }

    if (code.includes('try {') && code.includes('catch')) {
      strengths.push('Good error handling with try-catch blocks');
    }

    if (code.match(/\/\*\*[\s\S]*?\*\//)) {
      strengths.push('Well-documented code with JSDoc comments');
    }

    if (code.includes('export ') || code.includes('import ')) {
      strengths.push('Good modular code structure');
    }
  }

  private generateImprovements(code: string, improvements: string[]) {
    if (code.includes('var ')) {
      improvements.push('Replace var declarations with const or let');
    }

    if (code.includes('== ') && !code.includes('=== ')) {
      improvements.push('Use strict equality (===) for better type safety');
    }

    if (!code.includes('//') && !code.includes('/*')) {
      improvements.push('Add comments to explain complex logic');
    }

    const functionCount = (code.match(/function\s+\w+/g) || []).length;
    if (functionCount === 0 && code.length > 100) {
      improvements.push('Consider breaking code into smaller functions');
    }

    if (code.includes('console.log')) {
      improvements.push('Remove or replace console.log statements for production');
    }
  }
}

export const codeAnalysisEngine = new CodeAnalysisEngine();
