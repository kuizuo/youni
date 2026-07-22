import type { ProfileMediaKind } from "../../contracts/profiles";

const mediaPaths: Record<
	ProfileMediaKind,
	{ publicPrefix: string; storagePrefix: string }
> = {
	avatar: {
		publicPrefix: "/uploads/avatar/",
		storagePrefix: "avatar/",
	},
	cover: {
		publicPrefix: "/uploads/profile-cover/",
		storagePrefix: "profile-covers/",
	},
};
const storedFilePattern =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(gif|jpg|png|webp)$/;

export type ProfileMediaIdentity = {
	fileName: string;
	key: string;
	kind: ProfileMediaKind;
	origin: null | string;
	userId: null | string;
};

export function createProfileMediaIdentity({
	baseUrl,
	fileName,
	kind,
	userId,
}: {
	baseUrl: string;
	fileName: string;
	kind: ProfileMediaKind;
	userId: string;
}) {
	if (!userId || userId.includes("/") || !storedFilePattern.test(fileName)) {
		throw new Error("资料图片归属无效");
	}
	const paths = mediaPaths[kind];
	return {
		fileName,
		key: `${paths.storagePrefix}${userId}/${fileName}`,
		kind,
		origin: new URL(baseUrl).origin,
		url: new URL(
			`${paths.publicPrefix}${encodeURIComponent(userId)}/${fileName}`,
			baseUrl,
		).toString(),
		userId,
	};
}

export function parseProfileMediaIdentity(
	value: string,
): ProfileMediaIdentity | null {
	let path = value;
	let origin: null | string = null;
	if (value.startsWith("http://") || value.startsWith("https://")) {
		try {
			const url = new URL(value);
			path = url.pathname;
			origin = url.origin;
		} catch {
			return null;
		}
	}

	for (const kind of ["avatar", "cover"] as const) {
		const paths = mediaPaths[kind];
		const relativePath = path.startsWith(paths.storagePrefix)
			? path.slice(paths.storagePrefix.length)
			: path.startsWith(paths.publicPrefix)
				? path.slice(paths.publicPrefix.length)
				: null;
		if (!relativePath) continue;

		const parts = relativePath.split("/");
		const fileName = parts.at(-1) ?? "";
		if (!storedFilePattern.test(fileName)) return null;
		if (parts.length === 1) {
			return {
				fileName,
				key: `${paths.storagePrefix}${fileName}`,
				kind,
				origin,
				userId: null,
			};
		}
		if (parts.length !== 2 || !parts[0]) return null;

		let userId: string;
		try {
			userId = origin ? decodeURIComponent(parts[0]) : parts[0];
		} catch {
			return null;
		}
		if (!userId || userId.includes("/")) return null;
		return {
			fileName,
			key: `${paths.storagePrefix}${userId}/${fileName}`,
			kind,
			origin,
			userId,
		};
	}

	return null;
}

export function profileMediaUrl(
	identity: ProfileMediaIdentity & { userId: string },
	baseUrl: string,
) {
	const paths = mediaPaths[identity.kind];
	return new URL(
		`${paths.publicPrefix}${encodeURIComponent(identity.userId)}/${identity.fileName}`,
		baseUrl,
	).toString();
}
