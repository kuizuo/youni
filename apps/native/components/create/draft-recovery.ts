import type { ComposerSnapshot } from "@/components/create/create-types";

let pendingDraftRecovery: ComposerSnapshot | null = null;

export function setDraftRecovery(snapshot: ComposerSnapshot) {
	pendingDraftRecovery = snapshot;
}

export function clearDraftRecovery(expected?: ComposerSnapshot) {
	if (expected && pendingDraftRecovery !== expected) return;
	pendingDraftRecovery = null;
}

export function consumeDraftRecovery() {
	const snapshot = pendingDraftRecovery;
	pendingDraftRecovery = null;
	return snapshot;
}
