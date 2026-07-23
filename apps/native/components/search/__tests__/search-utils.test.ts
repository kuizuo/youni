import { expect, jest, test } from "@jest/globals";
import * as SecureStore from "expo-secure-store";

jest.mock("expo-secure-store", () => ({
	deleteItemAsync: jest.fn(),
	getItemAsync: jest.fn(),
	setItemAsync: jest.fn(),
}));

import {
	loadSearchHistory,
	persistSearchHistory,
	SEARCH_HISTORY_LIMIT,
} from "../search-utils";

test("repairs, limits, and persists search history", async () => {
	jest.mocked(SecureStore.setItemAsync).mockResolvedValue(undefined);
	jest.mocked(SecureStore.deleteItemAsync).mockResolvedValue(undefined);
	const stored = [
		" 露营 ",
		"摄影",
		"露营",
		...Array.from(
			{ length: SEARCH_HISTORY_LIMIT },
			(_, index) => `记录${index}`,
		),
		42,
	];
	jest
		.mocked(SecureStore.getItemAsync)
		.mockResolvedValue(JSON.stringify(stored));

	const history = await loadSearchHistory();

	expect(history).toHaveLength(SEARCH_HISTORY_LIMIT);
	expect(history.slice(0, 2)).toEqual(["露营", "摄影"]);

	persistSearchHistory(["咖啡", "城市"]);
	expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
		expect.any(String),
		JSON.stringify(["咖啡", "城市"]),
	);

	persistSearchHistory([]);
	expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(expect.any(String));
});
