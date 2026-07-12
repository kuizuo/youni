import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

export function ScanFrame({ children }: { children: ReactNode }) {
	return (
		<View style={styles.scanFrame}>
			<View pointerEvents="none" style={styles.scanGuide} />
			<View pointerEvents="none" style={[styles.scanCorner, styles.topLeft]} />
			<View pointerEvents="none" style={[styles.scanCorner, styles.topRight]} />
			<View
				pointerEvents="none"
				style={[styles.scanCorner, styles.bottomLeft]}
			/>
			<View
				pointerEvents="none"
				style={[styles.scanCorner, styles.bottomRight]}
			/>
			<View className="items-center gap-3">{children}</View>
		</View>
	);
}

const styles = StyleSheet.create({
	bottomLeft: {
		bottom: 0,
		borderBottomLeftRadius: 18,
		borderBottomWidth: 5,
		borderLeftWidth: 5,
		left: 0,
	},
	bottomRight: {
		bottom: 0,
		borderBottomRightRadius: 18,
		borderBottomWidth: 5,
		borderRightWidth: 5,
		right: 0,
	},
	scanCorner: {
		borderColor: "#ffffff",
		height: 48,
		position: "absolute",
		width: 48,
	},
	scanFrame: {
		alignItems: "center",
		alignSelf: "center",
		height: 256,
		justifyContent: "center",
		width: 256,
	},
	scanGuide: {
		...StyleSheet.absoluteFill,
		borderColor: "rgba(255, 255, 255, 0.2)",
		borderRadius: 28,
		borderWidth: StyleSheet.hairlineWidth,
	},
	topLeft: {
		borderLeftWidth: 5,
		borderTopLeftRadius: 18,
		borderTopWidth: 5,
		left: 0,
		top: 0,
	},
	topRight: {
		borderRightWidth: 5,
		borderTopRightRadius: 18,
		borderTopWidth: 5,
		right: 0,
		top: 0,
	},
});
