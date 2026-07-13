import { ShieldCheck } from "@gravity-ui/icons";
import {
	Button,
	Input,
	Label,
	Skeleton,
	TextArea,
	TextField,
} from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { UserGender } from "@youni/api/contracts/shared";
import { env } from "@youni/env/web";
import type { FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminPage } from "@/components/admin-shell";
import { UserRoleBadge, UserStatusBadge } from "@/components/admin-status";
import { orpc } from "@/utils/orpc";
import {
	genderLabel,
	genderOptions,
	getErrorMessage,
	toGender,
	toUserRole,
	toUserStatus,
} from "./-admin-users/types";
import {
	AvatarUploadField,
	SelectField,
} from "./-admin-users/user-form-fields";

type SettingsFormState = {
	name: string;
	image: string;
	handle: string;
	bio: string;
	gender: UserGender;
};

const emptyForm: SettingsFormState = {
	name: "",
	image: "",
	handle: "",
	bio: "",
	gender: "unknown",
};

const handlePattern = /^[a-zA-Z0-9_]+$/;

export const Route = createFileRoute("/admin/settings")({
	component: AdminSettingsRoute,
});

function AdminSettingsRoute() {
	const admin = useQuery(orpc.admin.me.queryOptions());
	const updateProfile = useMutation(
		orpc.admin.updateCurrentProfile.mutationOptions(),
	);
	const [form, setForm] = useState<SettingsFormState>(emptyForm);
	const [savedForm, setSavedForm] = useState<SettingsFormState>(emptyForm);
	const [formMessage, setFormMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

	useEffect(() => {
		const profile = admin.data?.user;
		if (!profile) return;

		const nextForm = {
			name: profile.name ?? "",
			image: profile.image ?? "",
			handle: profile.handle ?? "",
			bio: profile.bio ?? "",
			gender: toGender(profile.gender),
		};

		setForm(nextForm);
		setSavedForm(nextForm);
	}, [admin.data?.user]);

	const isDirty = useMemo(
		() => JSON.stringify(form) !== JSON.stringify(savedForm),
		[form, savedForm],
	);

	const uploadAvatar = useCallback(async (file: File) => {
		setFormMessage(null);
		setSuccessMessage(null);
		setIsUploadingAvatar(true);

		try {
			const body = new FormData();
			body.append("avatar", file);
			const response = await fetch(
				`${env.VITE_SERVER_URL}/admin/uploads/avatar`,
				{
					body,
					credentials: "include",
					method: "POST",
				},
			);
			const result = (await response.json().catch(() => null)) as {
				message?: string;
				url?: string;
			} | null;

			if (!response.ok || !result?.url) {
				throw new Error(result?.message || "头像上传失败");
			}

			return result.url;
		} catch (error) {
			setFormMessage(getErrorMessage(error));
			throw error;
		} finally {
			setIsUploadingAvatar(false);
		}
	}, []);

	const submitForm = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setFormMessage(null);
		setSuccessMessage(null);

		const name = form.name.trim();
		const handle = form.handle.trim();

		if (!name) {
			setFormMessage("请填写昵称");
			return;
		}

		if (handle && (handle.length < 2 || !handlePattern.test(handle))) {
			setFormMessage("用户名至少 2 位，只能使用字母、数字和下划线");
			return;
		}

		try {
			await updateProfile.mutateAsync({
				name,
				image: form.image.trim() || undefined,
				handle: handle || undefined,
				bio: form.bio.trim() || undefined,
				gender: form.gender,
			});
			const refreshed = await admin.refetch();
			const profile = refreshed.data?.user;
			const nextForm = profile
				? {
						name: profile.name ?? "",
						image: profile.image ?? "",
						handle: profile.handle ?? "",
						bio: profile.bio ?? "",
						gender: toGender(profile.gender),
					}
				: {
						name,
						image: form.image.trim(),
						handle,
						bio: form.bio.trim(),
						gender: form.gender,
					};

			setForm(nextForm);
			setSavedForm(nextForm);
			setSuccessMessage("设置已保存");
		} catch (error) {
			setFormMessage(getErrorMessage(error));
		}
	};

	const profile = admin.data?.user;
	const role = toUserRole(profile?.role ?? "user");
	const status = toUserStatus(profile?.status ?? "active");
	const createdAt = profile?.createdAt
		? new Date(profile.createdAt).toLocaleString()
		: "暂无记录";
	const updatedAt = profile?.updatedAt
		? new Date(profile.updatedAt).toLocaleString()
		: "暂无记录";

	return (
		<AdminPage title="设置">
			<form
				className="mx-auto flex w-full max-w-5xl flex-col gap-4"
				onSubmit={submitForm}
			>
				{admin.isLoading ? (
					<SettingsSkeleton />
				) : (
					<>
						<SettingsRow
							description="这些资料会用于后台识别当前操作者，也会复用到用户资料展示。"
							label="账号资料"
						>
							<AvatarUploadField
								isUploading={isUploadingAvatar}
								label="头像"
								name={form.name}
								value={form.image}
								onChange={(value) => {
									setForm((current) => ({ ...current, image: value }));
									setSuccessMessage(null);
								}}
								onUpload={uploadAvatar}
							/>
							<TextField name="settings-name">
								<Label>昵称</Label>
								<Input
									fullWidth
									value={form.name}
									onChange={(event) => {
										setForm((current) => ({
											...current,
											name: event.target.value,
										}));
										setSuccessMessage(null);
									}}
								/>
							</TextField>
							<TextField name="settings-email">
								<Label>邮箱</Label>
								<Input fullWidth readOnly value={profile?.email ?? ""} />
							</TextField>
							<TextField name="settings-handle">
								<Label>用户名</Label>
								<Input
									fullWidth
									placeholder="可选"
									value={form.handle}
									onChange={(event) => {
										setForm((current) => ({
											...current,
											handle: event.target.value,
										}));
										setSuccessMessage(null);
									}}
								/>
							</TextField>
							<SelectField
								id="settings-gender"
								label="性别"
								options={genderOptions.map((value) => ({
									label: genderLabel[value],
									value,
								}))}
								value={form.gender}
								onChange={(value) => {
									setForm((current) => ({ ...current, gender: value }));
									setSuccessMessage(null);
								}}
							/>
							<TextField className="flex flex-col gap-2" name="settings-bio">
								<Label>简介</Label>
								<TextArea
									className="min-h-24 resize-y"
									fullWidth
									maxLength={160}
									placeholder="可选"
									value={form.bio}
									onChange={(event) => {
										setForm((current) => ({
											...current,
											bio: event.target.value,
										}));
										setSuccessMessage(null);
									}}
								/>
							</TextField>
							{formMessage ? (
								<p className="rounded-xl bg-danger-soft px-3 py-2 text-danger-soft-foreground text-sm">
									{formMessage}
								</p>
							) : null}
							{successMessage ? (
								<p className="rounded-xl bg-success-soft px-3 py-2 text-sm text-success-soft-foreground">
									{successMessage}
								</p>
							) : null}
						</SettingsRow>

						<Separator />

						<SettingsRow
							description="这里展示当前账号的后台权限。角色和状态需要在用户管理里由其他管理员处理。"
							label="后台权限"
						>
							<div className="grid gap-3 sm:grid-cols-2">
								<InfoTile label="角色">
									<UserRoleBadge role={role} />
								</InfoTile>
								<InfoTile label="状态">
									<UserStatusBadge status={status} />
								</InfoTile>
								<InfoTile label="创建时间" value={createdAt} />
								<InfoTile label="更新时间" value={updatedAt} />
							</div>
							<div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3">
								<ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
								<p className="text-muted text-sm leading-6">
									{role === "admin"
										? "你可以管理内容、话题、用户和后台账号。"
										: "你可以处理内容、话题和普通用户，不能调整管理员账号。"}
								</p>
							</div>
						</SettingsRow>

						<Separator />

						<footer className="flex items-center justify-end gap-2 pt-2">
							<Button
								type="button"
								variant="ghost"
								isDisabled={!isDirty || updateProfile.isPending}
								onPress={() => {
									setForm(savedForm);
									setFormMessage(null);
									setSuccessMessage(null);
								}}
							>
								重置
							</Button>
							<Button
								type="submit"
								isDisabled={!isDirty || isUploadingAvatar}
								isPending={updateProfile.isPending}
							>
								保存修改
							</Button>
						</footer>
					</>
				)}
			</form>
		</AdminPage>
	);
}

function SettingsRow({
	children,
	description,
	label,
}: {
	children: ReactNode;
	description: string;
	label: string;
}) {
	return (
		<section className="flex flex-col gap-4 py-4">
			<div className="flex max-w-2xl flex-col gap-1">
				<h2 className="font-medium text-foreground text-sm">{label}</h2>
				<p className="text-muted text-xs leading-snug">{description}</p>
			</div>
			<div className="flex min-w-0 flex-col gap-3">{children}</div>
		</section>
	);
}

function Separator() {
	return <div className="h-px bg-separator" />;
}

function InfoTile({
	children,
	label,
	value,
}: {
	children?: ReactNode;
	label: string;
	value?: string;
}) {
	return (
		<div className="min-w-0 rounded-xl border border-border bg-surface p-3">
			<div className="text-muted text-xs">{label}</div>
			<div className="mt-2 truncate font-medium text-foreground text-sm">
				{children ?? value}
			</div>
		</div>
	);
}

function SettingsSkeleton() {
	return (
		<div className="grid gap-4">
			{["profile", "permissions"].map((key) => (
				<div className="flex flex-col gap-4 py-4" key={key}>
					<div className="grid gap-2">
						<Skeleton className="h-4 w-24 rounded-lg" />
						<Skeleton className="h-3 w-48 rounded-lg" />
					</div>
					<div className="grid gap-3">
						<Skeleton className="h-14 rounded-xl" />
						<Skeleton className="h-10 rounded-xl" />
					</div>
				</div>
			))}
		</div>
	);
}
