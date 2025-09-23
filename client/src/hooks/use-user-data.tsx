import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export function useUserData() {
  return useQuery<User>({
    queryKey: ["/api/user"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
