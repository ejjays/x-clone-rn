import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../utils/api";
import { useAuth } from "@clerk/clerk-expo";

export const useAllUsers = () => {
  const api = useApiClient();
  const { isSignedIn } = useAuth();

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => api.get("/users/all"),
    enabled: Boolean(isSignedIn),
    refetchOnWindowFocus: false,
    select: (response) => response.data,
  });

  return {
    users: usersData || [],
    isLoading,
    error,
    refetch,
  };
};