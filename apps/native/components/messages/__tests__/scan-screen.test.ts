import { expect, test } from "@jest/globals";

import { getUserIdFromCode } from "../scan/utils";

test("识别自己页面生成的好友二维码", () => {
	expect(getUserIdFromCode("youni:user:friend-123")).toBe("friend-123");
	expect(getUserIdFromCode("https://example.com")).toBeNull();
});
