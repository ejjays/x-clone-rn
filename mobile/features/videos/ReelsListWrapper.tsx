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
	// Disabled dynamic import to avoid duplicate RNGestureHandler registrations.
	// Library integration can be enabled once deduped and tested.
	const ReelsList: any = null;

	const [activeIndex, setActiveIndex] = useState(initialIndex);
	const handleIndex = useCallback((index: number) => {
		setActiveIndex(index);
		onIndexChange?.(index);
	}, [onIndexChange]);

	if (ReelsList) {
		return (
			<View style={{ flex: 1 }}>
				<ReelsList
					data={data}
					onChangeIndex={handleIndex}
					renderItem={({ item, index }: any) => renderItem({ item, index, isActive: index === activeIndex })}
					containerHeight={height}
				/>
			</View>
		);
	}

	// Fallback: robust pager implementation
	return (
		<PagerView
			style={{ flex: 1, width }}
			initialPage={initialIndex}
			orientation="vertical"
			onPageSelected={(e) => handleIndex(e.nativeEvent.position)}
			overScrollMode="never"
		>
			{data.map((item, index) => (
				<View key={item._id} style={{ width, height }}>
					{renderItem({ item, index, isActive: index === activeIndex })}
				</View>
			))}
		</PagerView>
	);
}