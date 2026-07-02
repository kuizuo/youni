import { fileURLToPath } from "node:url";

import { AwsClient } from "aws4fetch";
import { config } from "dotenv";

config({ path: fileURLToPath(new URL("../../../.env", import.meta.url).href) });
config({
	path: fileURLToPath(
		new URL("../../../packages/infra/.env", import.meta.url).href,
	),
});
config({
	path: fileURLToPath(
		new URL("../../../apps/server/.env", import.meta.url).href,
	),
});
config();

const runtimeEnv: Record<string, string | undefined> =
	typeof process === "undefined" ? {} : process.env;

type LocalR2PutOptions = {
	httpMetadata?: {
		cacheControl?: string;
		contentDisposition?: string;
		contentEncoding?: string;
		contentLanguage?: string;
		contentType?: string;
	};
};

let localYouniBucket: R2Bucket | undefined;

function requiredR2Env() {
	const config = {
		accountId: runtimeEnv.CLOUDFLARE_ACCOUNT_ID,
		accessKeyId: runtimeEnv.R2_ACCESS_KEY_ID,
		secretAccessKey: runtimeEnv.R2_SECRET_ACCESS_KEY,
		bucketName: runtimeEnv.R2_BUCKET_NAME,
	};

	if (
		!config.accountId ||
		!config.accessKeyId ||
		!config.secretAccessKey ||
		!config.bucketName
	) {
		return null;
	}

	return config as {
		accountId: string;
		accessKeyId: string;
		secretAccessKey: string;
		bucketName: string;
	};
}

function objectUrl(accountId: string, bucketName: string, key: string) {
	const encodedKey = key.split("/").map(encodeURIComponent).join("/");
	return `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${encodedKey}`;
}

function metadataHeaders(metadata: LocalR2PutOptions["httpMetadata"]) {
	const headers = new Headers();

	if (!metadata) {
		return headers;
	}

	if (metadata.cacheControl) {
		headers.set("cache-control", metadata.cacheControl);
	}
	if (metadata.contentDisposition) {
		headers.set("content-disposition", metadata.contentDisposition);
	}
	if (metadata.contentEncoding) {
		headers.set("content-encoding", metadata.contentEncoding);
	}
	if (metadata.contentLanguage) {
		headers.set("content-language", metadata.contentLanguage);
	}
	if (metadata.contentType) {
		headers.set("content-type", metadata.contentType);
	}

	return headers;
}

function createLocalYouniBucket() {
	const r2Env = requiredR2Env();
	if (!r2Env) {
		return undefined;
	}

	const client = new AwsClient({
		accessKeyId: r2Env.accessKeyId,
		secretAccessKey: r2Env.secretAccessKey,
		service: "s3",
		region: "auto",
	});

	return {
		async put(
			key: string,
			value: BodyInit,
			options: LocalR2PutOptions | undefined,
		) {
			const response = await client.fetch(
				objectUrl(r2Env.accountId, r2Env.bucketName, key),
				{
					body: value,
					headers: metadataHeaders(options?.httpMetadata),
					method: "PUT",
				},
			);

			if (!response.ok) {
				throw new Error(
					`R2 put failed: ${response.status} ${response.statusText}`,
				);
			}

			return null;
		},
		async get(key: string) {
			const response = await client.fetch(
				objectUrl(r2Env.accountId, r2Env.bucketName, key),
			);

			if (response.status === 404) {
				return null;
			}

			if (!response.ok) {
				throw new Error(
					`R2 get failed: ${response.status} ${response.statusText}`,
				);
			}

			const httpMetadata = {
				cacheControl: response.headers.get("cache-control") ?? undefined,
				contentDisposition:
					response.headers.get("content-disposition") ?? undefined,
				contentEncoding: response.headers.get("content-encoding") ?? undefined,
				contentLanguage: response.headers.get("content-language") ?? undefined,
				contentType: response.headers.get("content-type") ?? undefined,
			};

			return {
				body: response.body,
				httpEtag: response.headers.get("etag") ?? "",
				writeHttpMetadata(headers: Headers) {
					for (const [name, value] of Object.entries({
						"cache-control": httpMetadata.cacheControl,
						"content-disposition": httpMetadata.contentDisposition,
						"content-encoding": httpMetadata.contentEncoding,
						"content-language": httpMetadata.contentLanguage,
						"content-type": httpMetadata.contentType,
					})) {
						if (value) {
							headers.set(name, value);
						}
					}
				},
			};
		},
	} as unknown as R2Bucket;
}

function getLocalYouniBucket() {
	localYouniBucket ??= createLocalYouniBucket();
	return localYouniBucket;
}

export const env = new Proxy({} as Env, {
	get(_target, prop) {
		if (typeof prop !== "string") {
			return undefined;
		}

		if (prop === "YOUNI_BUCKET") {
			return getLocalYouniBucket();
		}

		return runtimeEnv[prop];
	},
});
