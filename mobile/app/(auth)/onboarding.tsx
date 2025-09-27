import type React from "react";
import { useCallback } from "react";
import {
  Dimensions,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  type ViewToken,
  Platform,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect, useRouter } from "expo-router";
import * as NavigationBar from "expo-navigation-bar";
import * as SystemUI from "expo-system-ui";
import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient"; // Import LinearGradient
import LottieView from "lottie-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const pages = [
  {
    text: "Welcome to PCMI - Infanta's mobile app!  We're glad you are here.",
    image: require("../../assets/animations/welcome.json"),
    type: "lottie",
  },
  {
    text: "Connect with our kapatids and church family, no matter the distance.",
    image: require("../../assets/animations/connect.json"),
    type: "lottie",
  },
  {
    text: "Share your journey, chat with friends, and join online Kamustahan. Here within our app!",
    image: require("../../assets/animations/social-media.json"),
    type: "lottie",
  },
];

interface ListItemProps {
  item: (typeof pages)[0];
  index: number;
  x: Animated.SharedValue<number>;
}

const ListItem: React.FC<ListItemProps> = ({ item, index, x }) => {
  const imageAnimatedStyle = useAnimatedStyle(() => {
    const opacityAnimation = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    const translateYAnimation = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [100, 0, 100],
      Extrapolation.CLAMP
    );
    return {
      opacity: opacityAnimation,
      transform: [{ translateY: translateYAnimation }],
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const opacityAnimation = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    const translateYAnimation = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [100, 0, 100],
      Extrapolation.CLAMP
    );
    return {
      opacity: opacityAnimation,
      transform: [{ translateY: translateYAnimation }],
    };
  });

  return (
    <View style={styles.itemContainer}>
      <View style={styles.circleContainer}>
        {item.type === "lottie" ? (
          <LottieView
            source={item.image}
            style={[styles.itemImage, imageAnimatedStyle]}
            autoPlay
            loop
          />
        ) : (
          <Animated.Image
            source={item.image}
            style={[styles.itemImage, imageAnimatedStyle]}
            resizeMode="contain"
          />
        )}
      </View>
      <Animated.Text style={[styles.itemText, textAnimatedStyle]}>
        {item.text}
      </Animated.Text>
    </View>
  );
};

interface PaginationElementProps {
  index: number;
  x: Animated.SharedValue<number>;
}

const PaginationElement: React.FC<PaginationElementProps> = ({ index, x }) => {
  const animatedDotStyle = useAnimatedStyle(() => {
    const widthAnimation = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [10, 20, 10],
      Extrapolation.CLAMP
    );
    const opacityAnimation = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );
    return {
      width: widthAnimation,
      opacity: opacityAnimation,
    };
  });

  return <Animated.View style={[styles.paginationDot, animatedDotStyle]} />;
};

interface ButtonProps {
  flatListRef: React.RefObject<Animated.FlatList<(typeof pages)[0]>>;
  flatListIndex: Animated.SharedValue<number>;
  onComplete?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  flatListRef,
  flatListIndex,
  onComplete,
}) => {
  const buttonAnimationStyle = useAnimatedStyle(() => {
    return {
      width:
        flatListIndex.value === pages.length - 1
          ? withSpring(140)
          : withSpring(60),
      height: 60,
    };
  });

  const arrowAnimationStyle = useAnimatedStyle(() => {
    return {
      width: 30,
      height: 30,
      opacity:
        flatListIndex.value === pages.length - 1
          ? withTiming(0)
          : withTiming(1),
      transform: [
        {
          translateX:
            flatListIndex.value === pages.length - 1
              ? withTiming(100)
              : withTiming(0),
        },
      ],
    };
  });

  const textAnimationStyle = useAnimatedStyle(() => {
    return {
      opacity:
        flatListIndex.value === pages.length - 1
          ? withTiming(1)
          : withTiming(0),
      transform: [
        {
          translateX:
            flatListIndex.value === pages.length - 1
              ? withTiming(0)
              : withTiming(-100),
        },
      ],
    };
  });

  const handlePress = () => {
    if (flatListIndex.value < pages.length - 1) {
      flatListRef.current?.scrollToIndex({ index: flatListIndex.value + 1 });
    } else {
      onComplete?.();
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.button, buttonAnimationStyle]}>
        <Animated.Text style={[styles.buttonText, textAnimationStyle]}>
          Get Started
        </Animated.Text>
        <Animated.View style={[styles.arrow, arrowAnimationStyle]}>
          <Text style={styles.arrowText}>→</Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

interface OnboardingScreenProps {
  onComplete?: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete: _onComplete,
}) => {
  const x = useSharedValue(0);
  const flatListIndex = useSharedValue(0);
  const flatListRef = useAnimatedRef<Animated.FlatList<(typeof pages)[0]>>();
  const { colors, isDarkMode } = useTheme();
  const router = useRouter();

  const onComplete = () => {
    router.push("/main-auth");
  };

  const changeNavBarColor = (color: string) => {
    NavigationBar.setBackgroundColorAsync(color);
    SystemUI.setBackgroundColorAsync(color);
    setTimeout(() => {
      NavigationBar.setBackgroundColorAsync(color);
      SystemUI.setBackgroundColorAsync(color);
    }, 50);
  };

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === "android") {
        // Use a fixed dark color for the navigation bar on onboarding, matching the bottom of the gradient
        const darkColor = "#0A1525";
        changeNavBarColor(darkColor);
        NavigationBar.setButtonStyleAsync("light");
      }
      return () => {
        if (Platform.OS === "android") {
          const revertColor = colors.background;
          NavigationBar.setBackgroundColorAsync(revertColor);
          SystemUI.setBackgroundColorAsync(revertColor);
          NavigationBar.setButtonStyleAsync(isDarkMode ? "light" : "dark");
        }
      };
    }, [colors, isDarkMode])
  );

  // Removed useAnimatedReaction for background color interpolation as we're using a static gradient

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (
        viewableItems[0]?.index !== null &&
        viewableItems[0]?.index !== undefined
      ) {
        flatListIndex.value = viewableItems[0].index;
      }
    },
    []
  );

  const scrollHandle = useAnimatedScrollHandler({
    onScroll: (event) => {
      x.value = event.contentOffset.x;
    },
  });

  const renderItem = useCallback(
    ({ item, index }: { item: (typeof pages)[0]; index: number }) => {
      return <ListItem item={item} index={index} x={x} />;
    },
    [x]
  );

  // Removed containerStyle as LinearGradient will handle the background

  return (
    <LinearGradient
      colors={["#101F3D", "#250A2C", "#0A1525"]} // Darker blue, subtle pinkish, and even darker blue gradient
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.FlatList
          ref={flatListRef}
          onScroll={scrollHandle}
          horizontal
          scrollEventThrottle={16}
          pagingEnabled
          data={pages}
          keyExtractor={(_, index) => index.toString()}
          bounces={false}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{
            minimumViewTime: 300,
            viewAreaCoveragePercentThreshold: 10,
          }}
        />
        <View style={styles.bottomContainer}>
          <View style={styles.paginationContainer}>
            {pages.map((_, index) => (
              <PaginationElement key={index} index={index} x={x} />
            ))}
          </View>
          <Button
            flatListRef={flatListRef}
            flatListIndex={flatListIndex}
            onComplete={onComplete}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 20,
  },
  circleContainer: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    justifyContent: "center",
    alignItems: "center",
    marginTop: "10%",
    alignSelf: "center",
  },
  itemImage: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    marginTop: "30%",
  },
  itemText: {
    textAlign: "left",
    fontSize: 22,
    fontFamily: "Lato_900Black",
    color: "#fff",
    marginHorizontal: 5,
    marginTop: "35%",
    lineHeight: 28,
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 50,
    paddingTop: 20,
  },
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  paginationDot: {
    height: 10,
    backgroundColor: "#fff",
    marginHorizontal: 2,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#fff",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  buttonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "600",
    position: "absolute",
  },
  arrow: {
    justifyContent: "center",
    alignItems: "center",
  },
  arrowText: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default OnboardingScreen;
