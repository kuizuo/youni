import type z from "zod";

export type FieldErrors<T extends Record<string, unknown>> = Partial<
	Record<keyof T, string>
>;

export function getFieldErrors<T extends Record<string, unknown>>(
	error: z.ZodError<T>,
): FieldErrors<T> {
	const errors: FieldErrors<T> = {};

	for (const issue of error.issues) {
		const field = issue.path[0];
		if (typeof field !== "string" || errors[field as keyof T]) continue;
		errors[field as keyof T] = issue.message;
	}

	return errors;
}
