import { useCallback } from "react";
import { Platform, StatusBar as RNStatusBar } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as SystemUI from "expo-system-ui";

export function useVideosStatusBar() {
	useFocusEffect(
		useCallback(() => {
			try {
				RNStatusBar.setHidden(false);
				if (Platform.OS === 'android') {
					RNStatusBar.setTranslucent(false);
					RNStatusBar.setBackgroundColor('#000000');
					SystemUI.setBackgroundColorAsync('#000000');
				}
			} catch {}
			return () => {
				try {
					RNStatusBar.setHidden(false);
					if (Platform.OS === 'android') {
						RNStatusBar.setTranslucent(false);
						RNStatusBar.setBackgroundColor('#000000');
						SystemUI.setBackgroundColorAsync('#000000');
					}
				} catch {}
			};
		}, [])
	);
}

