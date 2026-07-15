import { flushSync } from "react-dom";
import type { ViewStyle } from "react-native";

export const NOTE_TRANSITION_DURATION = 260;

export function getNoteTransitionStyle(id: string): ViewStyle {
	return {
		viewTransitionName: `note-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}`,
	} as ViewStyle;
}

export function supportsNoteViewTransition() {
	return (
		typeof document.startViewTransition === "function" &&
		!(
			typeof matchMedia === "function" &&
			matchMedia("(prefers-reduced-motion: reduce)").matches
		)
	);
}

export function startNoteViewTransition(update: () => void) {
	if (!supportsNoteViewTransition()) return false;

	const transition = document.startViewTransition(() => flushSync(update));
	void transition.finished.catch(() => undefined);
	return true;
}
