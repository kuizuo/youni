import { createContext } from "@youni/api/context";
import type { ProfileMediaKind } from "@youni/api/contracts/profiles";
import {
	createNoteImageIdentity,
	NOTE_IMAGE_MAX_COUNT,
	parseNoteImageIdentity,
	prepareNoteImageSource,
} from "@youni/api/lib/notes/image-identity";
import {
	createProfileMediaIdentity,
	parseProfileMediaIdentity,
} from "@youni/api/lib/profiles/media-identity";
import { hasAdminPermission } from "@youni/auth/permissions";
import { createDb } from "@youni/db";
import { user } from "@youni/db/schema/index";
import { env } from "@youni/env/server";
import { eq } from "drizzle-orm";
import { Hono, type Context as HonoContext } from "hono";

const uploads = new Hono();
const avatarPrefix = "avatar/";
const avatarMaxSize = 2 * 1024 * 1024;
const profileCoverPrefix = "profile-covers/";
const profileCoverMaxSize = 5 * 1024 * 1024;
const avatarContentTypes = new Map([
	["image/jpeg", "jpg"],
	["image/jpg", "jpg"],
	["image/png", "png"],
	["image/webp", "webp"],
	["image/gif", "gif"],
]);

async function assertBackofficeAccess(c: HonoContext) {
	const context = await createContext({ context: c });
	if (!context.session?.user) return null;

	const [account] = await createDb()
		.select({
			banned: user.banned,
			id: user.id,
			role: user.role,
			status: user.status,
		})
		.from(user)
		.where(eq(user.id, context.session.user.id))
		.limit(1);

	if (
		!account ||
		account.status !== "active" ||
		account.banned ||
		!hasAdminPermission(account.role, { backoffice: ["access"] })
	) {
		return null;
	}

	return account;
}

async function assertActiveUploadAccess(c: HonoContext) {
	const context = await createContext({ context: c });
	if (!context.session?.user) return null;

	const [account] = await createDb()
		.select({
			banned: user.banned,
			id: user.id,
			isAnonymous: user.isAnonymous,
			status: user.status,
		})
		.from(user)
		.where(eq(user.id, context.session.user.id))
		.limit(1);

	if (
		!account ||
		account.isAnonymous ||
		account.status !== "active" ||
		account.banned
	) {
		return null;
	}

	return account;
}

async function uploadProfileImageFromRequest(
	c: HonoContext,
	options: {
		fieldName: string;
		kind: ProfileMediaKind;
		label: string;
		maxSize: number;
		prefix: string;
		publicPath: string;
	},
	userId?: string,
) {
	if (!env.YOUNI_BUCKET) {
		return c.json({ message: `${options.label}存储尚未配置` }, 503);
	}

	const body = await c.req.parseBody();
	const file = body[options.fieldName];
	if (!(file instanceof File)) {
		return c.json({ message: `请选择${options.label}文件` }, 400);
	}

	const extension = avatarContentTypes.get(file.type);
	if (!extension) {
		return c.json(
			{ message: `${options.label}仅支持 JPG、PNG、WebP 或 GIF` },
			400,
		);
	}

	if (file.size > options.maxSize) {
		return c.json(
			{
				message: `${options.label}不能超过 ${options.maxSize / 1024 / 1024}MB`,
			},
			400,
		);
	}

	const fileName = `${crypto.randomUUID()}.${extension}`;
	const identity = userId
		? createProfileMediaIdentity({
				baseUrl: c.req.url,
				fileName,
				kind: options.kind,
				userId,
			})
		: null;
	const key = identity?.key ?? `${options.prefix}${fileName}`;

	await env.YOUNI_BUCKET.put(key, file.stream(), {
		httpMetadata: {
			cacheControl: "public, max-age=31536000, immutable",
			contentType: file.type,
		},
	});

	return c.json({
		key,
		url:
			identity?.url ??
			new URL(`${options.publicPath}/${fileName}`, c.req.url).toString(),
	});
}

function uploadAvatarFromRequest(c: HonoContext, userId?: string) {
	return uploadProfileImageFromRequest(
		c,
		{
			fieldName: "avatar",
			kind: "avatar",
			label: "头像",
			maxSize: avatarMaxSize,
			prefix: avatarPrefix,
			publicPath: "/uploads/avatar",
		},
		userId,
	);
}

function uploadProfileCoverFromRequest(c: HonoContext, userId?: string) {
	return uploadProfileImageFromRequest(
		c,
		{
			fieldName: "cover",
			kind: "cover",
			label: "背景图",
			maxSize: profileCoverMaxSize,
			prefix: profileCoverPrefix,
			publicPath: "/uploads/profile-cover",
		},
		userId,
	);
}

function getBodyFiles(body: Record<string, unknown>) {
	return Object.values(body).flatMap((value) => {
		if (value instanceof File) return [value];
		if (Array.isArray(value)) {
			return value.filter((item): item is File => item instanceof File);
		}
		return [];
	});
}

async function uploadNoteImagesFromRequest(c: HonoContext, userId: string) {
	if (!env.YOUNI_BUCKET) {
		return c.json({ message: "图片存储尚未配置" }, 503);
	}

	const body = await c.req.parseBody({ all: true });
	const files = getBodyFiles(body);
	if (files.length === 0) {
		return c.json({ message: "请选择图片文件" }, 400);
	}
	if (files.length > NOTE_IMAGE_MAX_COUNT) {
		return c.json(
			{ message: `最多只能上传 ${NOTE_IMAGE_MAX_COUNT} 张图片` },
			400,
		);
	}

	let preparedFiles: Array<{ contentType: string; file: File }>;
	try {
		preparedFiles = files.map((file) => ({
			file,
			...prepareNoteImageSource({
				fileName: file.name,
				fileSize: file.size,
				mimeType: file.type,
				uri: file.name,
			}),
		}));
	} catch (error) {
		return c.json(
			{ message: error instanceof Error ? error.message : "图片无效" },
			400,
		);
	}

	const uploaded: Array<{ key: string; url: string }> = [];
	try {
		for (const item of preparedFiles) {
			const identity = createNoteImageIdentity({
				baseUrl: c.req.url,
				fileId: crypto.randomUUID(),
				mimeType: item.contentType,
				userId,
			});

			await env.YOUNI_BUCKET.put(identity.key, item.file.stream(), {
				httpMetadata: {
					cacheControl: "public, max-age=31536000, immutable",
					contentType: identity.contentType,
				},
			});

			uploaded.push({ key: identity.key, url: identity.url });
		}
	} catch (error) {
		await Promise.allSettled(
			uploaded.map((item) => env.YOUNI_BUCKET?.delete(item.key)),
		);
		throw error;
	}

	return c.json({ items: uploaded });
}

async function serveStoredObject(c: HonoContext, key: string) {
	if (!env.YOUNI_BUCKET) return c.notFound();

	const object = await env.YOUNI_BUCKET.get(key);
	if (!object) return c.notFound();

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set("etag", object.httpEtag);
	headers.set("cache-control", "public, max-age=31536000, immutable");
	return new Response(object.body, { headers });
}

async function serveProfileMedia(
	c: HonoContext,
	kind: ProfileMediaKind,
	owned: boolean,
) {
	const identity = parseProfileMediaIdentity(c.req.url);
	if (
		!identity ||
		identity.kind !== kind ||
		Boolean(identity.userId) !== owned
	) {
		return c.notFound();
	}

	return serveStoredObject(c, identity.key);
}

uploads.post("/admin/uploads/avatar", async (c) => {
	const account = await assertBackofficeAccess(c);
	if (!account) return c.json({ message: "没有权限上传头像" }, 403);
	return uploadAvatarFromRequest(c);
});

uploads.post("/uploads/avatar", async (c) => {
	const account = await assertActiveUploadAccess(c);
	if (!account) return c.json({ message: "请先登录后再上传头像" }, 401);
	return uploadAvatarFromRequest(c, account.id);
});

uploads.post("/uploads/profile-cover", async (c) => {
	const account = await assertActiveUploadAccess(c);
	if (!account) {
		return c.json({ message: "请先登录后再上传背景图" }, 401);
	}
	return uploadProfileCoverFromRequest(c, account.id);
});

uploads.post("/uploads/profile-media/cleanup", async (c) => {
	const account = await assertActiveUploadAccess(c);
	if (!account) {
		return c.json({ message: "请先登录后再清理资料图片" }, 401);
	}
	if (!env.YOUNI_BUCKET) {
		return c.json({ message: "资料图片存储尚未配置" }, 503);
	}

	const body = await c.req.json<{ key?: unknown }>().catch(() => null);
	const identity =
		typeof body?.key === "string" ? parseProfileMediaIdentity(body.key) : null;
	if (!identity || identity.origin !== null || identity.userId !== account.id) {
		return c.json({ message: "资料图片清理请求无效" }, 400);
	}

	const [profile] = await createDb()
		.select({ coverImage: user.coverImage, image: user.image })
		.from(user)
		.where(eq(user.id, account.id))
		.limit(1);
	const boundKeys = [profile?.image, profile?.coverImage].flatMap((value) => {
		if (!value) return [];
		const bound = parseProfileMediaIdentity(value);
		return bound?.userId === account.id ? [bound.key] : [];
	});
	if (boundKeys.includes(identity.key)) {
		return c.json({ message: "资料图片正在使用" }, 409);
	}

	await env.YOUNI_BUCKET.delete(identity.key);
	return c.json({ deleted: 1 });
});

uploads.post("/uploads/note-images", async (c) => {
	const account = await assertActiveUploadAccess(c);
	if (!account) return c.json({ message: "请先登录后再上传图片" }, 401);
	return uploadNoteImagesFromRequest(c, account.id);
});

uploads.post("/uploads/note-images/cleanup", async (c) => {
	const account = await assertActiveUploadAccess(c);
	if (!account) return c.json({ message: "请先登录后再清理图片" }, 401);
	if (!env.YOUNI_BUCKET) {
		return c.json({ message: "图片存储尚未配置" }, 503);
	}

	const body = await c.req.json<{ keys?: unknown }>().catch(() => null);
	if (
		!body ||
		!Array.isArray(body.keys) ||
		body.keys.length > NOTE_IMAGE_MAX_COUNT
	) {
		return c.json({ message: "图片清理请求无效" }, 400);
	}
	const keys = body.keys.filter((key): key is string => {
		if (typeof key !== "string") return false;
		const identity = parseNoteImageIdentity(key);
		return identity?.origin === null && identity.userId === account.id;
	});
	if (keys.length !== body.keys.length) {
		return c.json({ message: "图片清理请求无效" }, 400);
	}

	await Promise.all(keys.map((key) => env.YOUNI_BUCKET?.delete(key)));
	return c.json({ deleted: keys.length });
});

uploads.get("/uploads/avatar/:fileName", (c) =>
	serveProfileMedia(c, "avatar", false),
);
uploads.get("/uploads/avatar/:userId/:fileName", (c) =>
	serveProfileMedia(c, "avatar", true),
);
uploads.get("/uploads/profile-cover/:fileName", (c) =>
	serveProfileMedia(c, "cover", false),
);
uploads.get("/uploads/profile-cover/:userId/:fileName", (c) =>
	serveProfileMedia(c, "cover", true),
);

uploads.get("/uploads/note-images/:fileName", (c) => {
	const identity = parseNoteImageIdentity(c.req.url);
	if (!identity || identity.userId !== null) return c.notFound();
	return serveStoredObject(c, identity.key);
});

uploads.get("/uploads/note-images/:userId/:fileName", (c) => {
	const identity = parseNoteImageIdentity(c.req.url);
	if (!identity?.userId) return c.notFound();
	return serveStoredObject(c, identity.key);
});

export default uploads;
