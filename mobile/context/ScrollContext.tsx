import type React from "react";
import { createContext, useContext } from "react";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";

interface ScrollContextType {
  scrollY: Animated.SharedValue<number>;
  handleScroll: (event: any) => void;
  headerTranslateY: Animated.SharedValue<number>;
}

const ScrollContext = createContext<ScrollContextType | null>(null);

export const ScrollProvider: React.FC<{
  children: React.ReactNode;
  headerHeight: number;
  tabBarHeight: number;
}> = ({ children, headerHeight, tabBarHeight }) => {
  const scrollY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);
  const headerTranslateY = useSharedValue(0);

  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentScrollY = event.contentOffset.y;
      const diff = lastScrollY.value - currentScrollY;

      if (currentScrollY < 0) {
        return;
      }

      headerTranslateY.value = Math.max(
        -(headerHeight + tabBarHeight),
        Math.min(0, headerTranslateY.value + diff)
      );

      lastScrollY.value = currentScrollY;
      scrollY.value = currentScrollY;
    },
  });

  return (
    <ScrollContext.Provider value={{ scrollY, handleScroll, headerTranslateY }}>
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