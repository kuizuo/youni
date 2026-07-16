export function createNoteViewRecorder(
	write: (noteId: string) => Promise<unknown>,
) {
	const recorded = new Set<string>();
	const recording = new Set<string>();

	return async ({
		noteId,
		viewerId,
	}: {
		noteId?: string;
		viewerId?: string;
	}) => {
		if (!noteId || !viewerId) return false;

		const key = `${noteId}:${viewerId}`;
		if (recorded.has(key) || recording.has(key)) return false;
		recording.add(key);
		try {
			await write(noteId);
			recorded.add(key);
			return true;
		} finally {
			recording.delete(key);
		}
	};
}
