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

console.log(`正在发布 Expo 线上版本 ${tag}...`);

const updateResult = Bun.spawnSync(
	[
		"bunx",
		"eas-cli@latest",
		"update",
		"--branch",
		"preview",
		"--message",
		`Release ${tag}`,
		"--environment",
		"production",
		"--non-interactive",
	],
	{
		cwd: new URL("../apps/native", import.meta.url).pathname,
		stderr: "inherit",
		stdout: "inherit",
	},
);

if (!updateResult.success) {
	console.error(`Expo 线上版本 ${tag} 发布失败。`);
	process.exit(updateResult.exitCode ?? 1);
}

console.log(`Expo 线上版本 ${tag} 发布成功。`);
