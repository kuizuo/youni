export type AnonymousSessionManagerDependencies = {
	createAnonymousSession: () => Promise<{
		error?: { message?: string } | null;
	}>;
	getSession: () => Promise<{ data?: { user?: unknown } | null }>;
	onPreparationError?: (error: unknown) => void;
};

export function createAnonymousSessionManager({
	createAnonymousSession,
	getSession,
	onPreparationError,
}: AnonymousSessionManagerDependencies) {
	let pending: Promise<void> | null = null;

	async function createIfMissing() {
		const current = await getSession();
		if (current.data?.user) return;

		const result = await createAnonymousSession();
		if (result.error) {
			throw new Error(result.error.message || "匿名身份创建失败");
		}
	}

	function ensure() {
		if (!pending) {
			pending = createIfMissing().finally(() => {
				pending = null;
			});
		}

		return pending;
	}

	async function prepareForAccountAuthentication() {
		try {
			await ensure();
		} catch (error) {
			onPreparationError?.(error);
		}
	}

	return { ensure, prepareForAccountAuthentication };
}
