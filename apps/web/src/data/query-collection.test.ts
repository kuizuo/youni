import { afterEach, describe, expect, test } from "bun:test";
import { QueryClient } from "@tanstack/react-query";

import {
	createQueryCollection,
	createSingletonQueryCollection,
} from "./query-collection";

const cleanups: Array<() => Promise<void>> = [];

afterEach(async () => {
	await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
});

function createQueryClient() {
	return new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
}

describe("query collection", () => {
	test("synchronizes list records through one reusable collection", async () => {
		let response = {
			items: [{ id: "first", name: "第一条" }],
			total: 1,
		};
		const scope = createQueryCollection({
			getKey: (item) => item.id,
			id: "test-list",
			queryClient: createQueryClient(),
			queryFn: async () => response,
			queryKey: ["test", "list"] as const,
			select: (data) => data.items,
			syncInterval: false,
		});
		cleanups.push(() => scope.collection.cleanup());

		await scope.collection.preload();
		expect(
			Array.from(scope.collection.values()).map(({ id, name }) => ({
				id,
				name,
			})),
		).toEqual(response.items);

		response = {
			items: [
				{ id: "first", name: "已更新" },
				{ id: "second", name: "第二条" },
			],
			total: 2,
		};
		await scope.collection.utils.refetch({ throwOnError: true });

		expect(
			Array.from(scope.collection.values()).map(({ id, name }) => ({
				id,
				name,
			})),
		).toEqual(response.items);
	});

	test("stores singleton responses as one live record", async () => {
		let response = { id: "overview", total: 1 };
		const scope = createSingletonQueryCollection({
			id: "test-overview",
			queryClient: createQueryClient(),
			queryFn: async () => response,
			queryKey: ["test", "overview"] as const,
			syncInterval: false,
		});
		cleanups.push(() => scope.collection.cleanup());

		await scope.collection.preload();
		expect(
			Array.from(scope.collection.values()).map(({ id, total }) => ({
				id,
				total,
			})),
		).toEqual([response]);

		response = { id: "overview", total: 2 };
		await scope.collection.utils.refetch({ throwOnError: true });
		expect(
			Array.from(scope.collection.values()).map(({ id, total }) => ({
				id,
				total,
			})),
		).toEqual([response]);
	});
});
