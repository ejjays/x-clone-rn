import { useState } from "react";
import { Alert } from "react-native";
import { useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useApiClient, userApi, postApi } from "../utils/api";
import { useCurrentUser } from "./useCurrentUser";
import { Post } from "../types";

export const useProfile = (userId: string) => {
  const api = useApiClient();

  const queryClient = useQueryClient();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
  });
  const { currentUser } = useCurrentUser();

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingPosts,
    error: postsError,
    refetch: refetchPosts,
  } = useInfiniteQuery({
    queryKey: ["userPosts", userId],
    queryFn: ({ pageParam = 1 }) => postApi.getUserPosts(api, userId, pageParam),
    getNextPageParam: (lastPage) => (lastPage.posts.length > 0 ? lastPage.currentPage + 1 : undefined),
    initialPageParam: 1,
    enabled: !!userId, // Only fetch if userId is available
  });

  const posts = postsData?.pages.flatMap((page) => page.posts) ?? [];

  const updateProfileMutation = useMutation({
    mutationFn: (profileData: any) => userApi.updateProfile(api, profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setIsEditModalVisible(false);
      Alert.alert("Success", "Profile updated successfully!");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.error || "Failed to update profile");
    },
  });

  const openEditModal = () => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        bio: currentUser.bio || "",
        location: currentUser.location || "",
      });
    }
    setIsEditModalVisible(true);
  };

  const updateFormField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    isEditModalVisible,
    formData,
    openEditModal,
    closeEditModal: () => setIsEditModalVisible(false),
    saveProfile: () => updateProfileMutation.mutate(formData),
    updateFormField,
    isUpdating: updateProfileMutation.isPending,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  };

  return {
    ...profileActions, // Spread the profile actions
    posts,
    isLoadingPosts,
    fetchNextPagePosts: fetchNextPage,
    hasNextPagePosts: hasNextPage,
  };
};
