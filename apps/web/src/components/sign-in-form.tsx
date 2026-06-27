import { Button, Input, Label, TextField } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignInForm() {
	const navigate = useNavigate({
		from: "/",
	});
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
						navigate({
							to: "/admin",
						});
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
		<div>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="flex flex-col gap-4"
			>
				<div>
					<form.Field name="email">
						{(field) => (
							<TextField className="flex flex-col gap-2">
								<Label htmlFor={field.name}>邮箱</Label>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									autoComplete="email"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="admin@youni.local"
									fullWidth
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-danger text-sm">
										{error?.message}
									</p>
								))}
							</TextField>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="password">
						{(field) => (
							<TextField className="flex flex-col gap-2">
								<Label htmlFor={field.name}>密码</Label>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									autoComplete="current-password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Admin123456"
									fullWidth
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-danger text-sm">
										{error?.message}
									</p>
								))}
							</TextField>
						)}
					</form.Field>
				</div>
				{formMessage ? (
					<p className="rounded-2xl bg-danger-soft px-3 py-2 text-danger-soft-foreground text-sm">
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
							type="submit"
							fullWidth
							isDisabled={!canSubmit || isSubmitting}
							isPending={isSubmitting}
						>
							{isSubmitting ? "登录中..." : "登录"}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}
