import { describe, expect, test } from "bun:test";

import { synchronizeSortableItems } from "./media-strip-state";

describe("synchronizeSortableItems", () => {
	test("拖拽坐标确认更新前不会替换图片列表", async () => {
		let finishPositionSync;
		const events = [];
		const synchronization = synchronizeSortableItems(
			[{ id: "second" }, { id: "third" }],
			() =>
				new Promise((resolve) => {
					finishPositionSync = () => {
						events.push("positions");
						resolve();
					};
				}),
			() => events.push("items"),
		);

		expect(events).toEqual([]);
		finishPositionSync();
		await synchronization;
		expect(events).toEqual(["positions", "items"]);
	});

	test("一次新增多张时会生成每一张图片的位置", async () => {
		let receivedPositions;
		await synchronizeSortableItems(
			[{ id: "first" }, { id: "second" }, { id: "third" }],
			(positions) => {
				receivedPositions = positions;
			},
			() => undefined,
		);

		expect(receivedPositions).toEqual({ first: 0, second: 1, third: 2 });
	});
});
