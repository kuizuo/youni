export type NoteFeedImpressionToken = {
	expiresAt: number;
	kind: "impression";
	noteId: string;
	position: number;
	sessionId: string;
};

export type NoteFeedCursorToken = {
	expiresAt: number;
	kind: "cursor";
	position: number;
	remainingPages: string[][];
	sessionId: string;
};

export type NoteFeedToken = NoteFeedCursorToken | NoteFeedImpressionToken;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array) {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary)
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
	const padded = `${value.replaceAll("-", "+").replaceAll("_", "/")}${"=".repeat((4 - (value.length % 4)) % 4)}`;
	const binary = atob(padded);
	return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function getSigningKey(secret: string) {
	return crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ hash: "SHA-256", name: "HMAC" },
		false,
		["sign", "verify"],
	);
}

function isNoteFeedToken(value: unknown): value is NoteFeedToken {
	if (typeof value !== "object" || value === null) return false;
	const token = value as Partial<NoteFeedToken>;
	if (
		typeof token.expiresAt !== "number" ||
		typeof token.position !== "number"
	) {
		return false;
	}
	if (token.kind === "impression") {
		return (
			typeof token.noteId === "string" &&
			token.noteId.length > 0 &&
			typeof token.sessionId === "string" &&
			token.sessionId.length > 0
		);
	}
	if (token.kind === "cursor") {
		return (
			typeof token.sessionId === "string" &&
			Array.isArray(token.remainingPages) &&
			token.remainingPages.every(
				(page) =>
					Array.isArray(page) &&
					page.every((id) => typeof id === "string" && id.length > 0),
			)
		);
	}
	return false;
}

export async function encodeNoteFeedToken(
	payload: NoteFeedToken,
	secret: string,
) {
	const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(payload)));
	const signature = await crypto.subtle.sign(
		"HMAC",
		await getSigningKey(secret),
		encoder.encode(encodedPayload),
	);
	return `${encodedPayload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function decodeNoteFeedToken(
	token: string,
	secret: string,
	now = new Date(),
): Promise<NoteFeedToken | null> {
	try {
		const [payloadPart, signaturePart, extraPart] = token.split(".");
		if (!payloadPart || !signaturePart || extraPart) return null;
		const valid = await crypto.subtle.verify(
			"HMAC",
			await getSigningKey(secret),
			fromBase64Url(signaturePart),
			encoder.encode(payloadPart),
		);
		if (!valid) return null;
		const payload: unknown = JSON.parse(
			decoder.decode(fromBase64Url(payloadPart)),
		);
		if (!isNoteFeedToken(payload) || payload.expiresAt <= now.getTime()) {
			return null;
		}
		return payload;
	} catch {
		return null;
	}
}
