import type { createDb } from "@youni/db";
import { verification } from "@youni/db/schema/auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { eq, lt } from "drizzle-orm";

export const passwordResetOtpEmailCooldownSeconds = 60;

const passwordResetOtpRateLimitPrefix = "password-reset-otp-send";
const passwordResetOtpRequestPaths = new Set([
	"/email-otp/request-password-reset",
	"/forget-password/email-otp",
]);

export function getPasswordResetOtpRateLimitIdentifier(email: string) {
	return `${passwordResetOtpRateLimitPrefix}:${email.trim().toLowerCase()}`;
}

export async function assertPasswordResetOtpEmailCanBeSent({
	db,
	email,
}: {
	db: ReturnType<typeof createDb>;
	email: string;
}) {
	const identifier = getPasswordResetOtpRateLimitIdentifier(email);
	const now = new Date();

	await db.delete(verification).where(lt(verification.expiresAt, now));

	const [existingLimit] = await db
		.select({ expiresAt: verification.expiresAt })
		.from(verification)
		.where(eq(verification.identifier, identifier))
		.limit(1);

	if (existingLimit && existingLimit.expiresAt > now) {
		throw APIError.from("TOO_MANY_REQUESTS", {
			code: "TOO_MANY_ATTEMPTS",
			message: "Too many attempts",
		});
	}

	await db.delete(verification).where(eq(verification.identifier, identifier));
	await db.insert(verification).values({
		id: crypto.randomUUID(),
		identifier,
		value: "1",
		expiresAt: new Date(
			now.getTime() + passwordResetOtpEmailCooldownSeconds * 1000,
		),
	});
}

export function passwordResetOtpRateLimitPlugin(
	db: ReturnType<typeof createDb>,
) {
	return {
		id: "password-reset-otp-rate-limit",
		hooks: {
			before: [
				{
					matcher(context: { path?: string }) {
						return context.path
							? passwordResetOtpRequestPaths.has(context.path)
							: false;
					},
					handler: createAuthMiddleware(async (ctx) => {
						const body = ctx.body as { email?: unknown } | undefined;
						if (typeof body?.email !== "string") {
							return;
						}

						await assertPasswordResetOtpEmailCanBeSent({
							db,
							email: body.email,
						});
					}),
				},
			],
		},
	};
}
