import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStreamChat } from "../context/StreamChatContext";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { formatDistanceToNow } from "date-fns";
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ChatScreenProps {
  channelId: string;
}

const ChatScreen = React.memo(({ channelId }: ChatScreenProps) => {
  const router = useRouter();
  const { client } = useStreamChat();
  const { user: currentUser } = useCurrentUser();
  const [channel, setChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);

  const isActiveRef = useRef(true);
  const cleanupRef = useRef<(() => void) | null>(null);

  const navigateBack = useCallback(() => {
    // IMMEDIATELY disable all operations
    isActiveRef.current = false;
    
    // IMMEDIATELY cleanup event listeners to stop all real-time updates
    if (cleanupRef.current) {
      try { 
        cleanupRef.current(); 
      } catch {}
      cleanupRef.current = null;
    }
    
    // IMMEDIATELY disable channel updates
    if (channel) {
      try {
        // Stop all channel event processing immediately
        channel.stopWatching?.().catch(() => {});
      } catch {}
    }
    
    // Start navigation with no delay
    router.back();
    
    // Defer only the final storage cleanup
    setTimeout(() => {
      try {
        (AsyncStorage as any)?.flushGetRequests?.();
      } catch {}
    }, 100);
  }, [channel, router]);

  // Add this useEffect right after your state declarations
  useEffect(() => {
    const handleBackPress = () => {
      navigateBack();
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    
    return () => {
      backHandler.remove();
    };
  }, [navigateBack]);

  const setMessagesOptimized = useCallback((newMessages: any) => {
    if (!isActiveRef.current) return; // Don't update if inactive
    
    // Batch state updates
    if (React.unstable_batchedUpdates) {
        React.unstable_batchedUpdates(() => {
            setMessages(newMessages);
        });
    } else {
        setMessages(newMessages);
    }
  }, []);

  useEffect(() => {
    if (!client || !currentUser) return;

    let ch: any;

    const initializeChannel = async () => {
      try {
        ch = client.channel("messaging", channelId);

        const handleEvent = (event: any) => {
          // Exit immediately if screen is inactive - this is crucial!
          if (!isActiveRef.current) return;
          
          // Use setTimeout instead of requestAnimationFrame to avoid blocking navigation
          setTimeout(() => {
            if (!isActiveRef.current) return; // Double check
            
            try {
              const eventChannel = event.channel || ch;
              const newMessages = eventChannel.state.messages.slice().reverse();
              
              // Only update if we're still active and have actual changes
              setMessages(prevMessages => {
                if (!isActiveRef.current) return prevMessages;
                if (prevMessages.length === newMessages.length && 
                    prevMessages[0]?.id === newMessages[0]?.id) {
                  return prevMessages; // No real changes
                }
                return newMessages;
              });
            } catch (error) {
              // Silent fail to avoid blocking
            }
          }, 0); // Immediate but non-blocking
        };
        
        const cleanup = () => {
          try {
            // Remove event listeners first
            ch.off("message.new", handleEvent);
            ch.off("message.updated", handleEvent);  
            ch.off("message.deleted", handleEvent);
            ch.off("reaction.new", handleEvent);
            ch.off("reaction.updated", handleEvent);
            ch.off("reaction.deleted", handleEvent);
            
            // Stop watching the channel to prevent further updates
            ch.stopWatching?.().catch(() => {});
            
          } catch {}
        };

        cleanupRef.current = cleanup;

        await ch.watch();
        setChannel(ch);

        const members = Object.values(ch.state.members);
        const otherMember = members.find(
          (member: any) => member.user.id !== currentUser.id
        );
        if (otherMember) {
          setOtherUser(otherMember.user);
        }

        setMessagesOptimized(ch.state.messages.slice().reverse());

        ch.on("message.new", handleEvent);
        ch.on("message.updated", handleEvent);
        ch.on("message.deleted", handleEvent);
        ch.on("reaction.new", handleEvent);
        ch.on("reaction.updated", handleEvent);
        ch.on("reaction.deleted", handleEvent);

      } catch (error) {
        console.error("❌ Error initializing channel:", error);
      }
    };

    initializeChannel();

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [client, channelId, currentUser, setMessagesOptimized]);

  useFocusEffect(
    useCallback(() => {
      isActiveRef.current = true;
      
      return () => {
        // Mark inactive FIRST - this is the most important line!
        isActiveRef.current = false;
        
        // Immediately cleanup event listeners - don't defer this
        if (cleanupRef.current) {
          try { 
            cleanupRef.current(); 
          } catch {}
          cleanupRef.current = null;
        }
        
        // Immediately stop channel watching
        if (channel) {
          try {
            channel.stopWatching?.().catch(() => {});
          } catch {}
        }
        
        // Only defer storage operations
        setTimeout(() => {
          try {
            (AsyncStorage as any)?.flushGetRequests?.();
          } catch {}
        }, 50);
      };
    }, [channel]) // Add channel as dependency
  );

  const sendMessage = async () => {
    if (!channel || !newMessage.trim()) return;

    try {
      await channel.sendMessage({
        text: newMessage.trim(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  };

  const renderMessage = ({ item: message }: { item: any }) => {
    const isFromCurrentUser = message.user?.id === currentUser?.id;

    return (
      <View
        className={`flex-row mb-4 ${isFromCurrentUser ? "justify-end" : "justify-start"}`}
      >
        {!isFromCurrentUser && (
          <Image
            source={{
              uri:
                message.user?.image ||
                `https://getstream.io/random_png/?name=${message.user?.name}`,
            }}
            className="w-8 h-8 rounded-full mr-2"
          />
        )}

        <View
          className={`max-w-[70%] p-3 rounded-2xl ${
            isFromCurrentUser
              ? "bg-blue-500 rounded-br-md"
              : "bg-gray-200 rounded-bl-md"
          }`}
        >
          <Text
            className={`text-base ${isFromCurrentUser ? "text-white" : "text-gray-900"}`}
          >
            {message.text}
          </Text>
          <Text
            className={`text-xs mt-1 ${isFromCurrentUser ? "text-blue-100" : "text-gray-500"}`}
          >
            {formatDistanceToNow(new Date(message.created_at), {
              addSuffix: true,
            })}
          </Text>
        </View>

        {isFromCurrentUser && (
          <Image
            source={{
              uri:
                currentUser.imageUrl ||
                `https://getstream.io/random_png/?name=${currentUser.firstName}`,
            }}
            className="w-8 h-8 rounded-full ml-2"
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={navigateBack} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        {otherUser && (
          <>
            <Image
              source={{
                uri:
                  otherUser.image ||
                  `https://getstream.io/random_png/?name=${otherUser.name}`,
              }}
              className="w-10 h-10 rounded-full mr-3"
            />
            <View className="flex-1">
              <Text className="font-semibold text-gray-900 text-lg">
                {otherUser.name}
              </Text>
              <Text className="text-gray-500 text-sm">
                {otherUser.online ? "Online" : "Offline"}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          className="flex-1 px-4 pt-4"
          inverted
          showsVerticalScrollIndicator={false}
        />

        {/* Message Input */}
        <View className="flex-row items-center p-4 border-t border-gray-200">
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 mr-3"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!newMessage.trim()}
            className={`p-2 rounded-full ${newMessage.trim() ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <Ionicons
              name="send"
              size={20}
              color={newMessage.trim() ? "white" : "gray"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

export default ChatScreen;