import React, { memo, useState, useMemo, useCallback } from "react"
import NoNotificationsFound from "@/components/NoNotificationsFound"
import NotificationCard from "@/components/NotificationCard"
import { useNotifications } from "@/hooks/useNotifications"
import type { Notification } from "@/types"
import { Check, Search } from "lucide-react-native" // Replaced Feather
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, InteractionManager, SectionList } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme } from "@/context/ThemeContext"; // Import useTheme
import { useFocusEffect } from "@react-navigation/native";

const NotificationsScreen = () => {
  const { notifications, isLoading, error, refetch, isRefetching, deleteNotification } = useNotifications()
  const { colors } = useTheme(); // Use useTheme hook
  const [refreshing, setRefreshing] = useState(false);
  const [ready, setReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        setReady(true);
      });
      return () => task.cancel();
    }, [])
  );

  const insets = useSafeAreaInsets()

  // Group notifications by time periods
  const groupedNotifications = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const groups = {
      new: [] as Notification[],
      today: [] as Notification[],
      yesterday: [] as Notification[],
      thisWeek: [] as Notification[],
      earlier: [] as Notification[],
    }

    notifications.forEach((notification) => {
      const notificationDate = new Date(notification.createdAt)
      const hoursDiff = (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60)

      if (hoursDiff < 1) {
        groups.new.push(notification)
      } else if (notificationDate >= today) {
        groups.today.push(notification)
      } else if (notificationDate >= yesterday) {
        groups.yesterday.push(notification)
      } else if (notificationDate >= thisWeek) {
        groups.thisWeek.push(notification)
      } else {
        groups.earlier.push(notification)
      }
    })

    return groups
  }, [notifications]);

  const renderSectionHeader = (title: string) => (
    <View className="px-4 pt-2 pb-3" style={{ backgroundColor: colors.background }}>
      <Text className="text-xl font-bold" style={{ color: colors.text }}>{title}</Text>
    </View>
  )

  if (error) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center p-8">
          <Text className="mb-4" style={{ color: colors.textMuted }}>Failed to load notifications</Text>
          <TouchableOpacity className="px-4 py-2 rounded-lg" style={{ backgroundColor: colors.blue }} onPress={() => refetch()}>
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  }, []);

  const isNotificationsEmpty = useMemo(() => {
    return Object.values(groupedNotifications).every(group => group.length === 0);
  }, [groupedNotifications]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 50 }}>
      <View className="px-4 pt-4">
        <Text className="text-3xl font-bold mb-2" style={{ color: colors.text }}>Notifications</Text>
      </View>
      <View style={{ flex: 1, justifyContent: isNotificationsEmpty ? 'center' : 'flex-start' }}>
        {ready ? (
          isNotificationsEmpty && !isLoading ? (
            <NoNotificationsFound />
          ) : (
            <SectionList
              sections={[
                { title: "New", data: groupedNotifications.new },
                { title: "Today", data: groupedNotifications.today },
                { title: "Yesterday", data: groupedNotifications.yesterday },
                { title: "This Week", data: groupedNotifications.thisWeek },
                { title: "Earlier", data: groupedNotifications.earlier },
              ]}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => <NotificationCard notification={item} onDelete={deleteNotification} />}
              renderSectionHeader={({ section: { title, data } }) => (
                data.length > 0 ? renderSectionHeader(title) : null
              )}
              contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh} 
                  tintColor={colors.refreshControlColor} 
                  colors={[colors.refreshControlColor]} 
                  progressBackgroundColor={colors.refreshControlBackgroundColor} />
              }
            />
          )
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.blue} />
          </View>
        )}
      </View>
    </View>
  )
}

export default memo(NotificationsScreen)