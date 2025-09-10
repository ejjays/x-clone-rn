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
};

export default function ReelsListWrapper({ data, height, width, renderItem, onIndexChange }: Props) {
	let ReelsList: any = null;
	try {
		// Optional: use library if present at runtime
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const mod = require("react-native-reels-list");
		ReelsList = mod?.default ?? mod;
	} catch {}

	const [activeIndex, setActiveIndex] = useState(0);
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
			initialPage={0}
			onPageSelected={(e) => handleIndex(e.nativeEvent.position)}
		>
			{data.map((item, index) => (
				<View key={item._id} style={{ width, height }}>
					{renderItem({ item, index, isActive: index === activeIndex })}
				</View>
			))}
		</PagerView>
	);
}

