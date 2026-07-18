import { expect, test } from "bun:test";

test("分享原生能力只在用户使用分享图时加载", async () => {
	const source = await Bun.file(
		new URL("./share-sheets.tsx", import.meta.url),
	).text();

	expect(source).not.toMatch(/from ["']expo-sharing["']/);
	expect(source).not.toMatch(/from ["']react-native-view-shot["']/);
	expect(source).toContain('await import("expo-sharing")');
	expect(source).toContain('await import("react-native-view-shot")');
});
