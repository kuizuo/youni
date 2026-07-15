export const NOTE_TRANSITION_DURATION = 260;

export function getNoteTransitionStyle(_id: string) {
	return {};
}

export function supportsNoteViewTransition() {
	return false;
}

export function startNoteViewTransition(_update: () => void) {
	return false;
}
