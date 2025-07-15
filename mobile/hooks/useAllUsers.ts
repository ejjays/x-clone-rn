import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../utils/api";

export const useAllUsers = () => {
  const api = useApiClient();

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => api.get("/users/all"),
    select: (response) => response.data,
  });

  return {
    users: usersData || [],
    isLoading,
    error,
    refetch,
  };
};