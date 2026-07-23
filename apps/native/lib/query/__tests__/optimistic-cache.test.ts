import { describe, expect, jest, test } from "@jest/globals";

import { createOptimisticToggleQueue } from "../optimistic-cache";

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((complete) => {
		resolve = complete;
	});
	return { promise, resolve };
}

describe("optimistic social actions", () => {
	test("keeps the final intent when the user taps twice quickly", async () => {
		const first = deferred<{ active: boolean; count: number }>();
		const calls: string[] = [];
		const refresh = jest.fn();
		const queue = createOptimisticToggleQueue({ refresh });
		const firstSettled = queue.toggle({
			count: 2,
			current: false,
			execute: () => {
				calls.push("first");
				return first.promise;
			},
			id: "note-1",
			kind: "like",
			select: (result) => result,
		});

		expect(queue.getState("like", "note-1", false, 2)).toEqual({
			active: true,
			count: 3,
		});

		const secondSettled = queue.toggle({
			count: 2,
			current: false,
			execute: async () => {
				calls.push("second");
				return { active: false, count: 2 };
			},
			id: "note-1",
			kind: "like",
			select: (result) => result,
		});

		first.resolve({ active: true, count: 3 });
		await Promise.all([firstSettled, secondSettled]);

		expect(calls).toEqual(["first", "second"]);
		expect(queue.getState("like", "note-1", false, 2)).toEqual({
			active: false,
			count: 2,
		});
		expect(queue.isPending("like", "note-1")).toBe(false);
		expect(refresh).toHaveBeenCalledTimes(1);
	});

	test("restores the confirmed state when a request fails", async () => {
		const failure = new Error("offline");
		const onError = jest.fn();
		const queue = createOptimisticToggleQueue({ refresh: () => {} });
		const settled = queue.toggle({
			count: 0,
			current: false,
			execute: async () => {
				throw failure;
			},
			id: "user-1",
			kind: "follow",
			onError,
			select: () => ({ active: true, count: 1 }),
		});

		expect(queue.getState("follow", "user-1", false, 0)).toEqual({
			active: true,
			count: 1,
		});

		await settled;

		expect(queue.getState("follow", "user-1", false, 0)).toEqual({
			active: false,
			count: 0,
		});
		expect(onError).toHaveBeenCalledWith(failure);
	});
});
