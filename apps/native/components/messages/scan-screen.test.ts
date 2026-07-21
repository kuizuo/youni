import { expect, test } from "bun:test";

import { getUserIdFromCode } from "@/components/messages/scan/utils";

test("识别自己页面生成的好友二维码", () => {
	expect(getUserIdFromCode("youni:user:friend-123")).toBe("friend-123");
	expect(getUserIdFromCode("https://example.com")).toBeNull();
});

test("相机预览不承载扫码界面", async () => {
	const source = await Bun.file(
		new URL("./scan-screen.tsx", import.meta.url),
	).text();

	expect(source).not.toContain("</CameraView>");
});

test("扫码页面不遮挡相机画面并能从相册识别二维码", async () => {
	const source = await Bun.file(
		new URL("./scan-screen.tsx", import.meta.url),
	).text();
	const overlaySource = await Bun.file(
		new URL("./scan/scan-overlay.tsx", import.meta.url),
	).text();

	expect(overlaySource).not.toContain("bg-black/70");
	expect(source).not.toContain('label: "相册入口已打开"');
	expect(source).toContain("launchImageLibraryAsync");
	expect(source).toContain("scanFromURLAsync");
});
