const nativeRoot = new URL("../apps/native", import.meta.url).pathname;

export function resolveRuntimeVersion(platform: "android" | "ios") {
	const result = Bun.spawnSync(
		["bunx", "expo-updates", "runtimeversion:resolve", "--platform", platform],
		{
			cwd: nativeRoot,
			stderr: "pipe",
			stdout: "pipe",
		},
	);

	if (!result.success) {
		const details = result.stderr.toString().trim();
		console.error(
			`${platform} 兼容版本读取失败，已停止 Expo 更新。${details ? `\n${details}` : ""}`,
		);
		process.exit(result.exitCode ?? 1);
	}

	try {
		const output = JSON.parse(result.stdout.toString()) as {
			runtimeVersion?: unknown;
		};
		if (
			typeof output.runtimeVersion === "string" &&
			output.runtimeVersion.length > 0
		) {
			return output.runtimeVersion;
		}
	} catch {
		// Fall through to the shared error below.
	}

	console.error(`${platform} 兼容版本无效，已停止 Expo 更新。`);
	process.exit(1);
}

function main() {
	const tagResult = Bun.spawnSync(
		["git", "describe", "--tags", "--exact-match", "HEAD"],
		{
			stderr: "pipe",
			stdout: "pipe",
		},
	);

	if (!tagResult.success) {
		console.error("当前版本没有对应的 Git 标签，已停止 Expo 更新。");
		process.exit(1);
	}

	const tag = tagResult.stdout.toString().trim();
	if (!/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(tag)) {
		console.error(`版本标签 ${tag} 格式不正确，已停止 Expo 更新。`);
		process.exit(1);
	}

	const androidRuntimeVersion = resolveRuntimeVersion("android");
	const iosRuntimeVersion = resolveRuntimeVersion("ios");

	if (androidRuntimeVersion !== iosRuntimeVersion) {
		console.error(
			`Android（${androidRuntimeVersion}）与 iOS（${iosRuntimeVersion}）兼容版本不一致，已停止 Expo 更新，避免被拆成多个更新组。`,
		);
		process.exit(1);
	}

	console.log(`正在发布 Expo 线上版本 ${tag}...`);

	const updateResult = Bun.spawnSync(
		[
			"bunx",
			"eas-cli@latest",
			"update",
			"--channel",
			"preview",
			"--platform",
			"all",
			"--message",
			`Release ${tag}`,
			"--environment",
			"production",
			"--non-interactive",
		],
		{
			cwd: nativeRoot,
			stderr: "inherit",
			stdout: "inherit",
		},
	);

	if (!updateResult.success) {
		console.error(`Expo 线上版本 ${tag} 发布失败。`);
		process.exit(updateResult.exitCode ?? 1);
	}

	console.log(`Expo 线上版本 ${tag} 发布成功。`);
}

if (import.meta.main) {
	main();
}
