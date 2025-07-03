import NoNotificationsFound from "@/components/NoNotificationsFound"
import NotificationCard from "@/components/NotificationCard"
import { useNotifications } from "@/hooks/useNotifications"
import type { Notification } from "@/types"
import { Feather } from "@expo/vector-icons"
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const NotificationsScreen = () => {
  const { notifications, isLoading, error, refetch, isRefetching, deleteNotification } = useNotifications()

  const insets = useSafeAreaInsets()

  // Group notifications by time periods
  const groupNotificationsByTime = (notifications: Notification[]) => {
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
  }

  const renderSectionHeader = (title: string) => (
    <View className="px-4 pt-1 pb-3 bg-white">
      <Text className="text-xl font-bold text-gray-900">{title}</Text>
    </View>
  )

  if (error) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-gray-500 mb-4">Failed to load notifications</Text>
          <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg" onPress={() => refetch()}>
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const groupedNotifications = groupNotificationsByTime(notifications)

  return (
    <View className="flex-1 bg-white">
      {/* Compact Facebook-style Header - No SafeAreaView, minimal spacing */}
      <View className="flex-row items-center px-4 py-3 bg-white" style={{ marginTop: -8 }}>
        <TouchableOpacity className="mr-4 p-1">
          <Feather name="arrow-left" size={26} color="#1C1E21" />
        </TouchableOpacity>

        <Text className="flex-1 text-2xl font-bold text-gray-900">Notifications</Text>

        <View className="flex-row space-x-2">
          <TouchableOpacity className="w-9 h-9 bg-gray-200 rounded-full items-center justify-center">
            <Feather name="check" size={18} color="#1C1E21" />
          </TouchableOpacity>
          <TouchableOpacity className="w-9 h-9 bg-gray-200 rounded-full items-center justify-center">
            <Feather name="search" size={18} color="#1C1E21" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={"#1877F2"} />}
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center p-8">
            <ActivityIndicator size="large" color="#1877F2" />
            <Text className="text-gray-500 mt-4">Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <NoNotificationsFound />
        ) : (
          <View className="bg-white">
            {/* New Notifications */}
            {groupedNotifications.new.length > 0 && (
              <>
                {renderSectionHeader("New")}
                {groupedNotifications.new.map((notification: Notification) => (
                  <NotificationCard key={notification._id} notification={notification} onDelete={deleteNotification} />
                ))}
              </>
            )}

            {/* Today */}
            {groupedNotifications.today.length > 0 && (
              <>
                {renderSectionHeader("Today")}
                {groupedNotifications.today.map((notification: Notification) => (
                  <NotificationCard key={notification._id} notification={notification} onDelete={deleteNotification} />
                ))}
              </>
            )}

            {/* Yesterday */}
            {groupedNotifications.yesterday.length > 0 && (
              <>
                {renderSectionHeader("Yesterday")}
                {groupedNotifications.yesterday.map((notification: Notification) => (
                  <NotificationCard key={notification._id} notification={notification} onDelete={deleteNotification} />
                ))}
              </>
            )}

            {/* This Week */}
            {groupedNotifications.thisWeek.length > 0 && (
              <>
                {renderSectionHeader("This Week")}
                {groupedNotifications.thisWeek.map((notification: Notification) => (
                  <NotificationCard key={notification._id} notification={notification} onDelete={deleteNotification} />
                ))}
              </>
            )}

            {/* Earlier */}
            {groupedNotifications.earlier.length > 0 && (
              <>
                {renderSectionHeader("Earlier")}
                {groupedNotifications.earlier.map((notification: Notification) => (
                  <NotificationCard key={notification._id} notification={notification} onDelete={deleteNotification} />
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default NotificationsScreen
