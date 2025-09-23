import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, Lightbulb, Code, Heart } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'suggestion' | 'help' | 'encouragement';
}

export function MascotChat() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: "Hey there! 👋 I'm your AI coding companion. I'm here to help you with your projects, answer questions, and provide guidance. What would you like to work on today?",
      isUser: false,
      timestamp: new Date(),
      type: 'encouragement'
    }
  ]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: mascotHistory } = useQuery({
    queryKey: ["/api/mascot/history"],
    select: (data) => data?.slice(0, 10), // Last 10 interactions
  });

  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; context?: any }) => {
      const response = await apiRequest("POST", "/api/mascot/chat", data);
      return await response.json();
    },
    onSuccess: (result) => {
      const botMessage: ChatMessage = {
        id: result.id,
        content: result.response,
        isUser: false,
        timestamp: new Date(result.createdAt),
        type: 'help'
      };
      setChatHistory(prev => [...prev, botMessage]);
    },
    onError: (error) => {
      toast({
        title: "Chat Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date(),
    };

    setChatHistory(prev => [...prev, userMessage]);
    
    chatMutation.mutate({
      message,
      context: { chatHistory: chatHistory.slice(-5) } // Send last 5 messages for context
    });
    
    setMessage("");
  };

  const quickPrompts = [
    {
      icon: Code,
      text: "Help me debug this code",
      prompt: "I'm having trouble with a bug in my code. Can you help me debug it?"
    },
    {
      icon: Lightbulb,
      text: "Project ideas",
      prompt: "Can you suggest some interesting coding project ideas for my skill level?"
    },
    {
      icon: Heart,
      text: "Motivate me",
      prompt: "I'm feeling stuck with my coding journey. Can you give me some encouragement?"
    }
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const getMessageTypeIcon = (type?: string) => {
    switch (type) {
      case 'suggestion':
        return <Lightbulb className="w-3 h-3 text-secondary" />;
      case 'help':
        return <Code className="w-3 h-3 text-primary" />;
      case 'encouragement':
        return <Heart className="w-3 h-3 text-accent" />;
      default:
        return <Bot className="w-3 h-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center mascot-bounce">
              <Bot className="text-white text-xl" />
            </div>
            <div>
              <CardTitle>AI Coding Companion</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your friendly mentor for coding guidance and support
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef} data-testid="chat-messages">
            <div className="space-y-4">
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${msg.id}`}
                >
                  {!msg.isUser && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-secondary to-accent text-white text-xs">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[70%] ${msg.isUser ? 'order-first' : ''}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        msg.isUser
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    
                    <div className={`flex items-center space-x-2 mt-1 text-xs text-muted-foreground ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                      {!msg.isUser && msg.type && (
                        <div className="flex items-center space-x-1">
                          {getMessageTypeIcon(msg.type)}
                          <span className="capitalize">{msg.type}</span>
                        </div>
                      )}
                      <span>{msg.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {msg.isUser && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs">
                        You
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {chatMutation.isPending && (
                <div className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-secondary to-accent text-white text-xs">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Prompts */}
          <div className="border-t border-border p-4">
            <p className="text-sm text-muted-foreground mb-3">Quick prompts:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, index) => {
                const IconComponent = prompt.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setMessage(prompt.prompt)}
                    data-testid={`quick-prompt-${index}`}
                  >
                    <IconComponent className="w-3 h-3 mr-1" />
                    {prompt.text}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="border-t border-border p-4">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything about coding..."
                className="flex-1"
                disabled={chatMutation.isPending}
                data-testid="input-chat-message"
              />
              <Button
                type="submit"
                disabled={chatMutation.isPending || !message.trim()}
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Chat Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Lightbulb className="w-8 h-8 text-secondary mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Smart Suggestions</h3>
            <p className="text-xs text-muted-foreground">
              Get personalized coding advice based on your projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Code className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Code Help</h3>
            <p className="text-xs text-muted-foreground">
              Debug issues and learn best practices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="w-8 h-8 text-accent mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Motivation</h3>
            <p className="text-xs text-muted-foreground">
              Stay motivated with encouraging feedback
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
