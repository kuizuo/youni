import { expect, test } from "bun:test";
import z from "zod";

import { getFieldErrors } from "./form-errors";

test("collects the first message for every invalid field", () => {
	const result = z
		.object({
			email: z.string().min(1, "请输入邮箱").email("邮箱格式错误"),
			password: z.string().min(8, "密码至少 8 位"),
		})
		.safeParse({ email: "", password: "short" });

	if (result.success) throw new Error("expected validation to fail");

	expect(getFieldErrors(result.error)).toEqual({
		email: "请输入邮箱",
		password: "密码至少 8 位",
	});
});
