export interface MascotResponse {
  message: string;
  type: 'encouragement' | 'suggestion' | 'help' | 'celebration';
  context?: any;
}

export class MascotPersonality {
  private personality = {
    traits: ['helpful', 'encouraging', 'technical', 'friendly'],
    tone: 'casual-professional',
    expertise: ['coding', 'best-practices', 'debugging', 'project-management'],
  };

  private responses = {
    greetings: [
      "Hey there! 👋 Ready to write some awesome code today?",
      "Welcome back, coding champion! 🚀 What should we build together?",
      "Hi! I'm excited to help you on your coding journey today! ✨",
    ],
    encouragement: [
      "You're doing amazing! Every line of code is progress! 💪",
      "Don't worry about bugs - they're just stepping stones to better code! 🐛➡️✨",
      "Remember, every expert was once a beginner. Keep going! 🌟",
      "Your dedication to learning is inspiring! Keep it up! 🔥",
    ],
    celebrations: [
      "Woohoo! 🎉 You just leveled up your coding skills!",
      "Amazing work! 🌟 Your code quality is improving!",
      "That's what I'm talking about! 🚀 You're on fire!",
      "Fantastic! 🎯 You're building something incredible!",
    ],
    codeHelp: [
      "Let me help you debug that! 🔍 Here's what I notice...",
      "Great question! 💡 Let's break this down step by step...",
      "I see what you're trying to do! 🎯 Here's a suggestion...",
      "No worries, we all get stuck sometimes! 🤝 Let me help...",
    ],
    suggestions: [
      "I noticed you're working on {context}. Want to try implementing {suggestion}?",
      "Based on your progress, I think you'd enjoy working on {suggestion} next!",
      "You're doing great with {context}! Ready for the next challenge: {suggestion}?",
    ],
  };

  generateResponse(input: string, context?: any, userId?: string): MascotResponse {
    const lowerInput = input.toLowerCase();

    // Determine response type based on input
    if (this.isGreeting(lowerInput)) {
      return this.generateGreeting();
    }

    if (this.isAskingForHelp(lowerInput)) {
      return this.generateHelpResponse(input, context);
    }

    if (this.isAskingForMotivation(lowerInput)) {
      return this.generateEncouragement();
    }

    if (this.isAskingForSuggestions(lowerInput)) {
      return this.generateSuggestion(context);
    }

    // Default helpful response
    return this.generateGeneralHelp(input, context);
  }

  generateSuggestion(userContext?: any): MascotResponse {
    const suggestions = [
      {
        message: "I noticed you're making great progress! How about implementing a user authentication system next? It's a valuable skill that many projects need! 🔐",
        context: { type: 'feature_suggestion', feature: 'authentication' },
      },
      {
        message: "Your code quality is looking good! Want to level up with some performance optimization? I can help you identify bottlenecks! ⚡",
        context: { type: 'improvement_suggestion', focus: 'performance' },
      },
      {
        message: "You've been coding consistently! How about trying a new technology or framework? It's a great way to expand your skills! 🚀",
        context: { type: 'learning_suggestion', focus: 'new_technology' },
      },
      {
        message: "I see you're building something awesome! Consider adding some tests to make your code more robust. I can guide you through it! 🧪",
        context: { type: 'quality_suggestion', focus: 'testing' },
      },
    ];

    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    return {
      message: randomSuggestion.message,
      type: 'suggestion',
      context: randomSuggestion.context,
    };
  }

  private generateGreeting(): MascotResponse {
    const greeting = this.getRandomResponse(this.responses.greetings);
    return {
      message: greeting,
      type: 'encouragement',
    };
  }

  private generateHelpResponse(input: string, context?: any): MascotResponse {
    const helpIntro = this.getRandomResponse(this.responses.codeHelp);
    
    let specificHelp = "";
    
    if (input.includes('bug') || input.includes('error')) {
      specificHelp = "Let's debug this together! Start by checking the console for error messages, then we can trace through the code step by step. 🔍";
    } else if (input.includes('optimize') || input.includes('performance')) {
      specificHelp = "Performance optimization is exciting! Let's look at your algorithms, check for unnecessary loops, and see if we can cache any expensive operations. ⚡";
    } else if (input.includes('test')) {
      specificHelp = "Testing is so important! Start with unit tests for your core functions, then add integration tests. I recommend Jest for JavaScript or pytest for Python! 🧪";
    } else {
      specificHelp = "I'm here to help with whatever you're working on! Feel free to share more details about your specific challenge. 💡";
    }

    return {
      message: `${helpIntro} ${specificHelp}`,
      type: 'help',
      context: { helpType: this.categorizeHelpRequest(input) },
    };
  }

  private generateEncouragement(): MascotResponse {
    const encouragement = this.getRandomResponse(this.responses.encouragement);
    return {
      message: encouragement,
      type: 'encouragement',
    };
  }

  private generateGeneralHelp(input: string, context?: any): MascotResponse {
    const responses = [
      "That's an interesting question! Let me think about the best way to help you with that. 🤔",
      "I'm here to support your coding journey! Could you tell me more about what you're trying to achieve? 💭",
      "Great question! The coding community is always here to help each other grow. Let's figure this out together! 🤝",
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      message: response,
      type: 'help',
      context: { inputAnalysis: this.analyzeInput(input) },
    };
  }

  private isGreeting(input: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    return greetings.some(greeting => input.includes(greeting));
  }

  private isAskingForHelp(input: string): boolean {
    const helpKeywords = ['help', 'debug', 'error', 'problem', 'stuck', 'issue', 'fix', 'solve'];
    return helpKeywords.some(keyword => input.includes(keyword));
  }

  private isAskingForMotivation(input: string): boolean {
    const motivationKeywords = ['motivate', 'encourage', 'stuck', 'frustrated', 'difficult', 'hard', 'give up'];
    return motivationKeywords.some(keyword => input.includes(keyword));
  }

  private isAskingForSuggestions(input: string): boolean {
    const suggestionKeywords = ['suggest', 'idea', 'recommend', 'what should', 'next step', 'what to do'];
    return suggestionKeywords.some(keyword => input.includes(keyword));
  }

  private categorizeHelpRequest(input: string): string {
    if (input.includes('bug') || input.includes('error')) return 'debugging';
    if (input.includes('performance') || input.includes('optimize')) return 'optimization';
    if (input.includes('test')) return 'testing';
    if (input.includes('design') || input.includes('architecture')) return 'architecture';
    return 'general';
  }

  private analyzeInput(input: string): any {
    return {
      length: input.length,
      hasCodeTerms: /\b(function|class|variable|array|object|method)\b/i.test(input),
      hasQuestionMarks: input.includes('?'),
      sentiment: this.determineSentiment(input),
    };
  }

  private determineSentiment(input: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['good', 'great', 'awesome', 'love', 'like', 'excited'];
    const negativeWords = ['bad', 'hate', 'frustrated', 'stuck', 'difficult', 'problem'];
    
    const hasPositive = positiveWords.some(word => input.includes(word));
    const hasNegative = negativeWords.some(word => input.includes(word));
    
    if (hasPositive && !hasNegative) return 'positive';
    if (hasNegative && !hasPositive) return 'negative';
    return 'neutral';
  }

  private getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  generateCelebration(achievement: string): MascotResponse {
    const celebration = this.getRandomResponse(this.responses.celebrations);
    return {
      message: `${celebration} You just unlocked: ${achievement}! 🏆`,
      type: 'celebration',
      context: { achievement },
    };
  }
}

export const mascotPersonality = new MascotPersonality();
