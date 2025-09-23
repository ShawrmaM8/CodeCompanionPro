import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function AIMascot() {
  const [dismissed, setDismissed] = useState(false);

  const { data: suggestion } = useQuery({
    queryKey: ["/api/mascot/suggestion"],
    refetchInterval: 30000, // Refresh suggestions every 30 seconds
  });

  const acceptSuggestionMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/mascot/chat", {
        message: "I'd like help with the suggested feature",
        context: { type: "suggestion_accepted", suggestion }
      });
    },
    onSuccess: () => {
      setDismissed(true);
      // Could redirect to specific guidance page
    },
  });

  if (dismissed || !suggestion) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-secondary/10 to-accent/10 rounded-xl p-6 border border-secondary/20">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center mascot-bounce">
          <Bot className="text-white text-2xl" />
        </div>
        <div className="flex-1">
          <div className="bg-white dark:bg-card rounded-lg p-4 shadow-sm border border-border relative">
            <div className="absolute -left-2 top-4 w-4 h-4 bg-white dark:bg-card border-l border-b border-border transform rotate-45" />
            <p className="text-foreground font-medium" data-testid="text-mascot-message">
              {suggestion?.message || "Hey there! I'm here to help you with your coding journey. Let's build something amazing together! 🚀"}
            </p>
            <p className="text-muted-foreground text-sm mt-2" data-testid="text-mascot-suggestion">
              {suggestion?.suggestion || "Want me to help you create your first project? I can guide you through the setup process!"}
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-3">
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => acceptSuggestionMutation.mutate()}
              disabled={acceptSuggestionMutation.isPending}
              data-testid="button-accept-suggestion"
            >
              {acceptSuggestionMutation.isPending ? "Starting..." : "Yes, help me!"}
            </Button>
            <Button 
              variant="secondary"
              onClick={() => setDismissed(true)}
              data-testid="button-dismiss-suggestion"
            >
              Maybe later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
