import React, { useMemo, useRef, useState, useCallback } from "react";
import { View, useWindowDimensions } from "react-native";
import PagerView from "react-native-pager-view";
import type { Post } from "@/types";

type Props = {
	data: Post[];
	height: number;
	width: number;
	renderItem: (args: { item: Post; index: number; isActive: boolean }) => React.ReactElement;
	onIndexChange?: (index: number) => void;
	initialIndex?: number;
};



export default function ReelsListWrapper({ data, height, width, renderItem, onIndexChange, initialIndex = 0 }: Props) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const handleIndex = useCallback((index: number) => {
    setActiveIndex(index);
    onIndexChange?.(index);
  }, [onIndexChange]);

  const pagerViewRef = useRef<PagerView>(null);

  // Ensure initialIndex is applied to PagerView
  useRef(() => {
    if (initialIndex !== 0) {
      pagerViewRef.current?.setPageWithoutAnimation(initialIndex);
    }
  }, [initialIndex]);

  return (
    <View style={{ flex: 1, height, width }}>
      <PagerView
        ref={pagerViewRef}
        style={{ flex: 1 }}
        initialPage={initialIndex}
        orientation="vertical"
        onPageSelected={(e) => handleIndex(e.nativeEvent.position)}
      >
        {data.map((item, index) => (
          <View key={item._id} style={{ height, width }}>
            {renderItem({ item, index, isActive: index === activeIndex })}
          </View>
        ))}
      </PagerView>
    </View>
  );
}