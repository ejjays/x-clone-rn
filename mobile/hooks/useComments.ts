import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { useApiClient, commentApi } from "../utils/api";
import { offlineQueue } from "@/utils/offline/OfflineQueue";

export const useComments = () => {
  const [commentText, setCommentText] = useState("");
  const api = useApiClient();

  const queryClient = useQueryClient();

  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const response = await commentApi.createComment(api, postId, content);
      return response.data;
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "posts" });
    },
    onError: async (err: any, vars: { postId: string; content: string }) => {
      if (!err?.response) {
        await offlineQueue.enqueue({ type: "comment_create", payload: { postId: vars.postId, content: vars.content } });
        setCommentText("");
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      } else {
        Alert.alert("Error", "Failed to post comment. Try again.");
      }
    },
  });

  // The function now accepts the needed data directly
  const createComment = (data: { postId: string; content: string }) => {
    if (!data.content.trim()) {
      Alert.alert("Empty Comment", "Please write something before posting!");
      return;
    }

    createCommentMutation.mutate(data);
  };

  return {
    commentText,
    setCommentText,
    createComment,
    isCreatingComment: createCommentMutation.isPending,
  };
};