import { useQuery } from "@tanstack/react-query";
import { UserAchievement, Achievement } from "@shared/schema";

export function useAchievements() {
  return useQuery<UserAchievement[]>({
    queryKey: ["/api/user/achievements"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAllAchievements() {
  return useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
