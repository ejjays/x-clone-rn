import type React from "react";
import { createContext, useContext } from "react";
import { useSharedValue, withTiming, SharedValue } from "react-native-reanimated";

interface ScrollContextType {
  scrollY: ReturnType<typeof useSharedValue<number>>;
  lastScrollY: ReturnType<typeof useSharedValue<number>>;
  handleScroll: (event: any) => void;
}

const ScrollContext = createContext<ScrollContextType | null>(null);

// Define constants for header and tab bar heights
const HEADER_HEIGHT = 35;
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
      if (Math.abs(scrollDelta) > SCROLL_THRESHOLD) {
        if (scrollDelta > 0) {
          // Scrolling down, hide header if visible
          if (isHeaderVisible.value) {
            headerHeight.value = withTiming(0, { duration: 100 }); // Smooth hide
            isHeaderVisible.value = false;
          }
        } else if (scrollDelta < 0) {
          // Scrolling up, show header if hidden
          if (!isHeaderVisible.value) {
            headerHeight.value = withTiming(HEADER_HEIGHT, { duration: 100 }); // Smooth show
            isHeaderVisible.value = true;
          }
        }
      }
    } else { 
      // For non-home screens, ensure header is always hidden and smooth transition
      if (isHeaderVisible.value) {
        headerHeight.value = withTiming(0, { duration: 100 });
        isHeaderVisible.value = false;
      }
    }

    // Handle tab bar visibility based on profile screen status, ensures smooth hide/show
    tabBarHeight.value = withTiming(isProfileScreen ? 0 : TAB_BAR_HEIGHT, {
      duration: 100,
    });

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
