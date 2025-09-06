import type React from "react";
import { createContext, useContext } from "react";
import { useSharedValue, SharedValue } from "react-native-reanimated";

interface ScrollContextType {
  scrollY: ReturnType<typeof useSharedValue<number>>;
  lastScrollY: ReturnType<typeof useSharedValue<number>>;
  handleScroll: (event: any) => void;
}

const ScrollContext = createContext<ScrollContextType | null>(null);

// Define constants for header and tab bar heights
const HEADER_HEIGHT = 40;
const TAB_BAR_HEIGHT = 50;

export const ScrollProvider: React.FC<{
  children: React.ReactNode;
  headerHeight: SharedValue<number>;
  tabBarHeight: SharedValue<number>;
  isHomeScreen: boolean;
  isProfileScreen: boolean;
}> = ({
  children,
  headerHeight,
  tabBarHeight,
  isHomeScreen,
  isProfileScreen,
}) => {
  const scrollY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);
  // Track the actual visibility state of the header to prevent rapid toggling
  const isHeaderVisible = useSharedValue(true); 

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDelta = currentScrollY - lastScrollY.value;

    // Define a threshold to prevent flickering for small movements
    const SCROLL_THRESHOLD = 20; 

    if (isHomeScreen) {
      // Keep header visible statically on home; no animations during tab switches
      headerHeight.value = HEADER_HEIGHT;
    } else {
      // Hide header on other tabs without animation
      headerHeight.value = 0;
      isHeaderVisible.value = false;
    }

    // Keep tab bar static based on profile screen; no animations
    tabBarHeight.value = isProfileScreen ? 0 : TAB_BAR_HEIGHT;

    lastScrollY.value = currentScrollY;
  };

  return (
    <ScrollContext.Provider
      value={{ scrollY, lastScrollY, handleScroll }}
    >
      {children}
    </ScrollContext.Provider>
  );
};

export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScroll must be used within a ScrollProvider");
  }
  return context;
};
