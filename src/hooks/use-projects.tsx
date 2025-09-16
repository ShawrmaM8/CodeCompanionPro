import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ["/api/projects"],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useProject(id: string) {
  return useQuery<Project>({
    queryKey: ["/api/projects", id],
    enabled: !!id,
  });
}
