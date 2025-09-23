import { Layout } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap } from "lucide-react";
import { useUserData } from "@/hooks/use-user-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Subscription() {
  const { data: user } = useUserData();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateSubscriptionMutation = useMutation({
    mutationFn: async (tier: 'free' | 'pro' | 'premium') => {
      await apiRequest("PUT", "/api/user/subscription", { tier });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Subscription Updated",
        description: "Your subscription has been updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const plans = [
    {
      name: "Free",
      tier: "free" as const,
      price: "$0",
      description: "Perfect for getting started",
      icon: Star,
      features: [
        "1 project",
        "Basic code analysis",
        "Community support",
        "Basic mascot interactions",
        "Achievement tracking",
      ],
      limitations: [
        "Limited LLM integration",
        "Basic offline sync",
      ],
    },
    {
      name: "Pro",
      tier: "pro" as const,
      price: "$20",
      description: "Best for serious developers",
      icon: Zap,
      features: [
        "3 projects",
        "Advanced code analysis",
        "Priority support",
        "Enhanced mascot AI",
        "Detailed progress tracking",
        "Custom milestone goals",
        "Export capabilities",
      ],
      popular: true,
    },
    {
      name: "Premium",
      tier: "premium" as const,
      price: "$50",
      description: "For teams and professionals",
      icon: Crown,
      features: [
        "Unlimited projects",
        "Enterprise code analysis",
        "24/7 support",
        "Advanced AI features",
        "Team collaboration",
        "Custom integrations",
        "Advanced analytics",
        "White-label options",
      ],
    },
  ];

  return (
    <Layout>
      <main className="flex-1 overflow-auto">
        <Header 
          title="Subscription Plans" 
          subtitle="Choose the plan that best fits your coding journey" 
        />
        
        <div className="p-6">
          {/* Current Plan */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Current Plan
                <Badge variant="secondary" className="capitalize">
                  {user?.subscriptionTier || 'free'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You are currently on the{' '}
                <span className="capitalize font-medium">
                  {user?.subscriptionTier || 'free'}
                </span>{' '}
                plan.
              </p>
            </CardContent>
          </Card>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const IconComponent = plan.icon;
              const isCurrentPlan = user?.subscriptionTier === plan.tier;
              
              return (
                <Card 
                  key={plan.tier} 
                  className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold">
                      {plan.price}
                      {plan.tier !== 'free' && (
                        <span className="text-sm font-normal text-muted-foreground">
                          /month
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-accent" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                      {plan.limitations?.map((limitation, index) => (
                        <li key={index} className="flex items-center gap-2 text-muted-foreground">
                          <div className="w-4 h-4 border border-muted rounded-full" />
                          <span className="text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      disabled={isCurrentPlan || updateSubscriptionMutation.isPending}
                      onClick={() => updateSubscriptionMutation.mutate(plan.tier)}
                      data-testid={`button-select-${plan.tier}`}
                    >
                      {isCurrentPlan ? (
                        "Current Plan"
                      ) : updateSubscriptionMutation.isPending ? (
                        "Updating..."
                      ) : (
                        `Switch to ${plan.name}`
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Offline Notice */}
          <Card className="mt-8 border-accent/20 bg-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                <div>
                  <h4 className="font-semibold text-accent">Offline-First Design</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    All plans work offline by default. Your data is stored locally and 
                    synchronized when you're online. No internet? No problem!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </Layout>
  );
}
