import { useCallback } from "react";
import { Platform, StatusBar as RNStatusBar } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as SystemUI from "expo-system-ui";

export function useVideosStatusBar() {
	useFocusEffect(
		useCallback(() => {
			try {
				RNStatusBar.setHidden(false);
				RNStatusBar.setTranslucent(true);
				RNStatusBar.setBackgroundColor('transparent');
				if (Platform.OS === 'android') {
					SystemUI.setBackgroundColorAsync('transparent');
				}
			} catch {}
			return () => {
				try {
					RNStatusBar.setHidden(false);
					RNStatusBar.setTranslucent(false);
					RNStatusBar.setBackgroundColor('#000000');
					if (Platform.OS === 'android') {
						SystemUI.setBackgroundColorAsync('#000000');
					}
				} catch {}
			};
		}, [])
	);
}

