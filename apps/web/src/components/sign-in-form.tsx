import { Button, Input, Label, TextField } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignInForm() {
	const { isPending } = authClient.useSession();
	const [formMessage, setFormMessage] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			setFormMessage(null);
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: () => {
						authClient.$store.notify("$sessionSignal");
					},
					onError: (error) => {
						setFormMessage(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("请输入正确的邮箱"),
				password: z.string().min(8, "密码至少 8 位"),
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="w-full">
			<form
				className="flex flex-col gap-5"
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					form.handleSubmit();
				}}
			>
				<form.Field name="email">
					{(field) => {
						const errorMessage = field.state.meta.errors[0]?.message;

						return (
							<TextField
								className="flex flex-col gap-2"
								isInvalid={Boolean(errorMessage)}
							>
								<Label className="font-medium" htmlFor={field.name}>
									邮箱
								</Label>
								<Input
									autoComplete="email"
									autoFocus
									className="h-11"
									fullWidth
									id={field.name}
									name={field.name}
									placeholder="请输入管理员邮箱"
									type="email"
									value={field.state.value}
									variant="secondary"
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
								{errorMessage ? (
									<p className="text-danger text-sm" role="alert">
										{errorMessage}
									</p>
								) : null}
							</TextField>
						);
					}}
				</form.Field>

				<form.Field name="password">
					{(field) => {
						const errorMessage = field.state.meta.errors[0]?.message;

						return (
							<TextField
								className="flex flex-col gap-2"
								isInvalid={Boolean(errorMessage)}
							>
								<Label className="font-medium" htmlFor={field.name}>
									密码
								</Label>
								<Input
									autoComplete="current-password"
									className="h-11"
									fullWidth
									id={field.name}
									name={field.name}
									placeholder="请输入登录密码"
									type="password"
									value={field.state.value}
									variant="secondary"
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
								{errorMessage ? (
									<p className="text-danger text-sm" role="alert">
										{errorMessage}
									</p>
								) : null}
							</TextField>
						);
					}}
				</form.Field>

				{formMessage ? (
					<p
						className="rounded-2xl bg-danger-soft px-4 py-3 text-danger-soft-foreground text-sm"
						role="alert"
					>
						{formMessage}
					</p>
				) : null}

				<form.Subscribe
					selector={(state) => ({
						canSubmit: state.canSubmit,
						isSubmitting: state.isSubmitting,
					})}
				>
					{({ canSubmit, isSubmitting }) => (
						<Button
							className="mt-1 h-11"
							fullWidth
							isDisabled={!canSubmit || isSubmitting}
							isPending={isSubmitting}
							size="lg"
							type="submit"
						>
							{isSubmitting ? "登录中..." : "登录后台"}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}
