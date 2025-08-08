import NoNotificationsFound from "@/components/NoNotificationsFound"
import NotificationCard from "@/components/NotificationCard"
import { useNotifications } from "@/hooks/useNotifications"
import type { Notification } from "@/types"
import { Check, Search } from "lucide-react-native" // Replaced Feather
import { View, Text, TouchableOpacity, SectionList, ActivityIndicator, RefreshControl } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme } from "@/context/ThemeContext"; // Import useTheme

const NotificationsScreen = () => {
  const { notifications, isLoading, error, refetch, isRefetching, deleteNotification } = useNotifications()
  const { colors } = useTheme(); // Use useTheme hook

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

  const groupedNotifications = groupNotificationsByTime(notifications)
  const sections = [
    { title: "New", data: groupedNotifications.new },
    { title: "Today", data: groupedNotifications.today },
    { title: "Yesterday", data: groupedNotifications.yesterday },
    { title: "This Week", data: groupedNotifications.thisWeek },
    { title: "Earlier", data: groupedNotifications.earlier },
  ].filter((section) => section.data.length > 0)

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Facebook-style Header - No back arrow, bigger title, good spacing */}
      <View className="flex-row items-center justify-between px-4 py-4" style={{ backgroundColor: colors.background }}>
        <Text className="text-3xl font-bold" style={{ color: colors.text }}>Notifications</Text>

        <View className="flex-row space-x-2">
          <TouchableOpacity className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: colors.surface }}>
            <Check size={18} color={colors.icon} />
          </TouchableOpacity>
          <TouchableOpacity className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: colors.surface }}>
            <Search size={18} color={colors.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center p-8" style={{backgroundColor:colors.background}}>
          <ActivityIndicator size="large" color={colors.blue} />
          <Text className="mt-4" style={{ color: colors.textMuted }}>Loading notifications...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <NoNotificationsFound />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item: Notification) => item._id}
          renderItem={({ item }) => (
            <NotificationCard notification={item} onDelete={deleteNotification} />
          )}
          renderSectionHeader={({ section: { title } }) => renderSectionHeader(title)}
          contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.blue} colors={[colors.blue]} />}
          stickySectionHeadersEnabled={false}
          removeClippedSubviews
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={11}
        />
      )}
    </View>
  )
}

export default NotificationsScreen