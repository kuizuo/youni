type PreparedPublication<TPayload> = {
	payload: TPayload;
	uploadedKeys: string[];
};

function createPublishAttemptId() {
	if (typeof globalThis.crypto?.randomUUID === "function") {
		return `publish_${globalThis.crypto.randomUUID()}`;
	}
	return `publish_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

export class NotePublishAttempt<TPayload> {
	private attemptId = createPublishAttemptId();
	private key: string | null = null;
	private prepared: PreparedPublication<TPayload> | null = null;

	reset() {
		this.attemptId = createPublishAttemptId();
		this.key = null;
		this.prepared = null;
	}

	async run<TResult>({
		cleanup,
		isUnknownResult,
		key,
		prepare,
		submit,
	}: {
		cleanup: (uploadedKeys: string[]) => Promise<void>;
		isUnknownResult: (error: unknown) => boolean;
		key: string;
		prepare: (
			publishAttemptId: string,
		) => Promise<PreparedPublication<TPayload>>;
		submit: (payload: TPayload) => Promise<TResult>;
	}) {
		if (this.key === null) {
			this.key = key;
		} else if (this.key !== key) {
			this.attemptId = createPublishAttemptId();
			this.key = key;
			this.prepared = null;
		}

		this.prepared ??= await prepare(this.attemptId);
		try {
			const result = await submit(this.prepared.payload);
			this.reset();
			return result;
		} catch (error) {
			if (!isUnknownResult(error)) {
				const keys = this.prepared.uploadedKeys;
				await cleanup(keys).catch(() => undefined);
				this.reset();
			}
			throw error;
		}
	}
}
