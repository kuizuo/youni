export type AnonymousSessionManagerDependencies = {
	createAnonymousSession: () => Promise<{
		error?: { message?: string } | null;
	}>;
	getSession: () => Promise<{ data?: { user?: unknown } | null }>;
};

const globalForAnonymousSession = globalThis as typeof globalThis & {
	youniAnonymousSessionPending?: Promise<void>;
};

export function createAnonymousSessionManager({
	createAnonymousSession,
	getSession,
}: AnonymousSessionManagerDependencies) {
	async function createIfMissing() {
		const current = await getSession();
		if (current.data?.user) return;

		const result = await createAnonymousSession();
		if (result.error) {
			throw new Error(result.error.message || "匿名身份创建失败");
		}
	}

	function ensure() {
		if (!globalForAnonymousSession.youniAnonymousSessionPending) {
			globalForAnonymousSession.youniAnonymousSessionPending =
				createIfMissing().finally(() => {
					globalForAnonymousSession.youniAnonymousSessionPending = undefined;
				});
		}

		return globalForAnonymousSession.youniAnonymousSessionPending;
	}

	return { ensure };
}
