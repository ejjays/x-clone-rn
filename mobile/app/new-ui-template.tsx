import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react-native';

const tabs = [
  { key: 'home', icon: Home },
  { key: 'search', icon: Search },
  { key: 'post', icon: PlusSquare },
  { key: 'likes', icon: Heart },
  { key: 'profile', icon: User },
];

const TabBar = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [animation] = useState(new Animated.Value(0));

  const handlePress = (tab) => {
    setActiveTab(tab);
    const index = tabs.findIndex((t) => t.key === tab);
    Animated.spring(animation, {
      toValue: index,
      useNativeDriver: true,
    }).start();
  };

  const translateX = animation.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [-160, -80, 0, 80, 160],
  });

  return (
    <View style={styles.tabBarContainer}>
      <Animated.View style={[styles.activeTabIndicator, { transform: [{ translateX }] }]} />
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tabItem}
          onPress={() => handlePress(tab.key)}
        >
          <tab.icon size={24} color={activeTab === tab.key ? '#fff' : '#888'} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function NewUITemplate() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>New UI Template</Text>
      </View>
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingVertical: 20,
    paddingHorizontal: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
  },
  activeTabIndicator: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignSelf: 'center',
  },
});