import { useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useEffect, useRef } from "react";

type TabNavigation = {
	addListener: (event: "tabPress", listener: () => void) => () => void;
};

export function useTabReselect(onReselect: () => void) {
	const navigation = useNavigation<TabNavigation>();
	const onReselectRef = useRef(onReselect);

	useEffect(() => {
		onReselectRef.current = onReselect;
	}, [onReselect]);

	useFocusEffect(
		useCallback(
			() => navigation.addListener("tabPress", () => onReselectRef.current()),
			[navigation],
		),
	);
}
