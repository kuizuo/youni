import { expect, test } from "bun:test";

test("相机预览不承载扫码界面", async () => {
	const source = await Bun.file(
		new URL("./scan-screen.tsx", import.meta.url),
	).text();

	expect(source).not.toContain("</CameraView>");
});
