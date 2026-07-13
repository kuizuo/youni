import { useSyncExternalStore } from "react";

import { queryClient } from "@/lib/query/query-client";

export type OptimisticToggleKind =
	| "collect"
	| "commentLike"
	| "follow"
	| "like";

type OptimisticToggleState = {
	active: boolean;
	count?: number;
};

export type OptimisticToggleRequest<TResult> = {
	count?: number;
	current: boolean;
	execute: () => Promise<TResult>;
	id: string;
	kind: OptimisticToggleKind;
	onError?: (error: unknown) => void;
	onSettled?: () => void;
	onSuccess?: (result: TResult) => Promise<void> | void;
	select: (result: TResult) => OptimisticToggleState;
};

type QueuedRequest = Omit<
	OptimisticToggleRequest<unknown>,
	"count" | "current" | "id" | "kind"
>;

type QueueEntry = {
	confirmed: OptimisticToggleState;
	desired: boolean;
	hasResult: boolean;
	request: null | QueuedRequest;
	resolve: () => void;
	running: boolean;
	settled: Promise<void>;
};

function getKey(kind: OptimisticToggleKind, id: string) {
	return `${kind}\0${id}`;
}

function createCompletion() {
	let resolve = () => {};
	const settled = new Promise<void>((complete) => {
		resolve = complete;
	});
	return { resolve, settled };
}

async function runSafely(callback?: () => Promise<void> | void) {
	try {
		await callback?.();
	} catch {
		// UI callbacks must not interrupt the queued server actions.
	}
}

class OptimisticToggleQueue {
	private readonly entries = new Map<string, QueueEntry>();
	private readonly listeners = new Set<() => void>();
	private readonly refresh: () => Promise<unknown> | unknown;
	private version = 0;

	constructor({ refresh }: { refresh: () => Promise<unknown> | unknown }) {
		this.refresh = refresh;
	}

	getSnapshot = () => this.version;

	subscribe = (listener: () => void) => {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	};

	getState(
		kind: OptimisticToggleKind,
		id: string,
		current: boolean,
		count?: number,
	): OptimisticToggleState {
		const key = getKey(kind, id);
		const entry = this.entries.get(key);
		if (!entry) return { active: current, count };

		if (
			!entry.running &&
			entry.hasResult &&
			entry.confirmed.active === current
		) {
			queueMicrotask(() => {
				const latest = this.entries.get(key);
				if (latest !== entry || latest.running) return;
				this.entries.delete(key);
				this.notify();
			});
			return { active: current, count };
		}

		return {
			active: entry.desired,
			count:
				typeof entry.confirmed.count === "number"
					? Math.max(
							0,
							entry.confirmed.count +
								(entry.desired === entry.confirmed.active
									? 0
									: entry.desired
										? 1
										: -1),
						)
					: undefined,
		};
	}

	isPending(kind: OptimisticToggleKind, id: string) {
		return this.entries.get(getKey(kind, id))?.running ?? false;
	}

	toggle<TResult>(request: OptimisticToggleRequest<TResult>) {
		const key = getKey(request.kind, request.id);
		const queuedRequest: QueuedRequest = {
			execute: request.execute,
			onError: request.onError,
			onSettled: request.onSettled,
			onSuccess: request.onSuccess as QueuedRequest["onSuccess"],
			select: request.select as QueuedRequest["select"],
		};
		const existing = this.entries.get(key);

		if (existing) {
			existing.desired = !existing.desired;
			existing.request = queuedRequest;
			if (!existing.running) {
				const completion = createCompletion();
				existing.resolve = completion.resolve;
				existing.settled = completion.settled;
				existing.running = true;
				void this.drain(key, existing);
			}
			this.notify();
			return existing.settled;
		}

		const completion = createCompletion();
		const entry: QueueEntry = {
			confirmed: { active: request.current, count: request.count },
			desired: !request.current,
			hasResult: false,
			request: queuedRequest,
			resolve: completion.resolve,
			running: true,
			settled: completion.settled,
		};
		this.entries.set(key, entry);
		this.notify();
		void this.drain(key, entry);
		return entry.settled;
	}

	private async drain(key: string, entry: QueueEntry) {
		while (this.entries.get(key) === entry) {
			const request = entry.request;
			if (!request) return;
			entry.request = null;

			let result: unknown;
			try {
				result = await request.execute();
			} catch (error) {
				await runSafely(() => request.onError?.(error));
				await runSafely(request.onSettled);
				if (entry.hasResult) {
					entry.desired = entry.confirmed.active;
					entry.running = false;
					entry.request = null;
					entry.resolve();
					this.notify();
				} else {
					this.entries.delete(key);
					entry.resolve();
					this.notify();
				}
				this.refreshInBackground();
				return;
			}

			entry.confirmed = request.select(result);
			entry.hasResult = true;
			await runSafely(() => request.onSuccess?.(result));
			await runSafely(request.onSettled);

			if (entry.desired !== entry.confirmed.active) {
				entry.request ??= request;
				continue;
			}

			entry.request = null;
			entry.running = false;
			entry.resolve();
			this.notify();
			this.refreshInBackground();
			return;
		}
	}

	private notify() {
		this.version += 1;
		for (const listener of this.listeners) listener();
	}

	private refreshInBackground() {
		try {
			void Promise.resolve(this.refresh()).catch(() => undefined);
		} catch {
			// The confirmed button state remains visible until a later refresh.
		}
	}
}

export function refreshActiveQueries() {
	return queryClient.invalidateQueries({ refetchType: "active" });
}

export function createOptimisticToggleQueue({
	refresh = refreshActiveQueries,
}: {
	refresh?: () => Promise<unknown> | unknown;
} = {}) {
	return new OptimisticToggleQueue({ refresh });
}

const optimisticToggleQueue = createOptimisticToggleQueue();

export function useOptimisticToggleQueue() {
	useSyncExternalStore(
		optimisticToggleQueue.subscribe,
		optimisticToggleQueue.getSnapshot,
		optimisticToggleQueue.getSnapshot,
	);
	return optimisticToggleQueue;
}
