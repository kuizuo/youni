import type {
	ProfileMediaKind,
	ProfilesOutputs,
} from "@youni/api/contracts/profiles";

type ProfileMediaUpload = { key: string };
const DEFINITIVE_BINDING_ERROR_CODES = new Set([
	"BAD_REQUEST",
	"CONFLICT",
	"FORBIDDEN",
	"NOT_FOUND",
	"TOO_MANY_REQUESTS",
	"UNAUTHORIZED",
]);

export type ProfileMediaSubmissionAdapters = {
	bind: (input: {
		key: string;
	}) => Promise<ProfilesOutputs["updateProfileMedia"]>;
	cleanup: (key: string) => Promise<void>;
	pickAndUpload: (kind: ProfileMediaKind) => Promise<null | ProfileMediaUpload>;
	refresh: () => Promise<void>;
};

function isDefinitiveBindingFailure(error: unknown) {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		DEFINITIVE_BINDING_ERROR_CODES.has(String(error.code))
	);
}

export function createProfileMediaSubmission(
	adapters: ProfileMediaSubmissionAdapters,
) {
	return async (kind: ProfileMediaKind) => {
		const uploaded = await adapters.pickAndUpload(kind);
		if (!uploaded) return null;

		let bound: ProfilesOutputs["updateProfileMedia"];
		try {
			bound = await adapters.bind({ key: uploaded.key });
		} catch (error) {
			if (isDefinitiveBindingFailure(error)) {
				await adapters.cleanup(uploaded.key).catch(() => {});
			}
			throw error;
		}

		await Promise.allSettled([
			bound.previousKey && bound.previousKey !== uploaded.key
				? adapters.cleanup(bound.previousKey)
				: Promise.resolve(),
			adapters.refresh(),
		]);
		return bound.profile;
	};
}
