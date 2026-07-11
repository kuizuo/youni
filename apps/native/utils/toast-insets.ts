export type AppSafeAreaInsets = {
	bottom: number;
	left: number;
	right: number;
	top: number;
};

export function getAppToastInsets(insets: AppSafeAreaInsets) {
	return {
		bottom: insets.bottom + 92,
		left: insets.left + 16,
		right: insets.right + 16,
		top: insets.top + 12,
	};
}
