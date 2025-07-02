import { useQuery } from "@tanstack/react-query";
import { useApiClient, postApi } from "../utils/api";

export const useVideoPosts = () => {
  const api = useApiClient();

  const {
    data: postsData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['videoPosts'],
    queryFn: () => postApi.getVideoPosts(api),
    select: (response) => response.data.posts,
  });

  return {
    videoPosts: postsData || [],
    isLoading,
    error,
    refetch,
    isRefetching,
  };
};