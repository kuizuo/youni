import { purgeLegacyDrafts } from "@youni/api/lib/legacy-draft-cleanup";
import { env } from "@youni/env/server";

const execute = process.argv.includes("--execute");
const configuredOrigins = process.env.LEGACY_DRAFT_IMAGE_ORIGINS?.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);
const defaultOrigin = env.BETTER_AUTH_URL
	? new URL(env.BETTER_AUTH_URL).origin
	: undefined;
const allowedOrigins = new Set(
	configuredOrigins?.length
		? configuredOrigins.map((origin) => new URL(origin).origin)
		: defaultOrigin
			? [defaultOrigin]
			: [],
);

if (allowedOrigins.size === 0) {
	throw new Error("请设置旧图片所属的服务地址；命令默认只做预览。");
}
if (execute && !env.YOUNI_BUCKET) {
	throw new Error("图片存储不可用，未执行清理。");
}

const result = await purgeLegacyDrafts({
	allowedOrigins,
	bucket: env.YOUNI_BUCKET,
	dryRun: !execute,
});

console.log(JSON.stringify(result, null, 2));
