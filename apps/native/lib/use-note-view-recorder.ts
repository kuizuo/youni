import { useMutation } from "@tanstack/react-query";
import * as Network from "expo-network";
import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";

import { createNoteViewRecorder } from "@/lib/note-view-recorder";
import { client } from "@/utils/orpc";

const NON_RETRYABLE_CODES = new Set(["FORBIDDEN", "NOT_FOUND", "UNAUTHORIZED"]);

function shouldRetry(failureCount: number, error: unknown) {
	return !(
		failureCount >= 2 ||
		(typeof error === "object" &&
			error !== null &&
			"code" in error &&
			NON_RETRYABLE_CODES.has(String(error.code)))
	);
}

export function useNoteViewRecorder({
	noteId,
	viewerId,
}: {
	noteId?: string;
	viewerId?: string;
}) {
	const mutation = useMutation({
		mutationFn: (id: string) => client.notes.recordView({ id }),
		retry: shouldRetry,
	});
	const writeRef = useRef(mutation.mutateAsync);
	writeRef.current = mutation.mutateAsync;
	const recorderRef = useRef<ReturnType<typeof createNoteViewRecorder> | null>(
		null,
	);
	recorderRef.current ??= createNoteViewRecorder((id) => writeRef.current(id));

	const record = useCallback(async () => {
		try {
			await recorderRef.current?.({ noteId, viewerId });
		} catch {
			// Recording a view is best-effort and can retry when the app reconnects.
		}
	}, [noteId, viewerId]);
	useEffect(() => {
		void record();
	}, [record]);
	useEffect(() => {
		const appStateSubscription = AppState.addEventListener(
			"change",
			(state) => {
				if (state === "active") void record();
			},
		);
		const networkSubscription = Network.addNetworkStateListener((state) => {
			if (state.isConnected && state.isInternetReachable !== false) {
				void record();
			}
		});
		return () => {
			appStateSubscription.remove();
			networkSubscription.remove();
		};
	}, [record]);
}
