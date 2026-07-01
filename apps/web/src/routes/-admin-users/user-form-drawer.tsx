import { Button, Drawer } from "@heroui/react";
import type { FormEvent } from "react";

import { userRoleLabel, userStatusLabel } from "@/components/admin-status";

import {
	genderLabel,
	genderOptions,
	getAvailableRoleOptions,
	getAvailableStatusOptions,
	type UserFormMode,
	type UserFormState,
	type UserRole,
	userFormId,
} from "./types";
import {
	AvatarUploadField,
	SelectField,
	TextInputField,
} from "./user-form-fields";

export function UserFormDrawer({
	currentRole,
	currentUserId,
	form,
	formMessage,
	isOpen,
	isSubmitting,
	isUploadingAvatar,
	mode,
	onCancel,
	onChange,
	onSubmit,
	onUploadAvatar,
}: {
	currentRole?: UserRole;
	currentUserId?: string;
	form: UserFormState;
	formMessage: string | null;
	isOpen: boolean;
	isSubmitting: boolean;
	isUploadingAvatar: boolean;
	mode: UserFormMode;
	onCancel: () => void;
	onChange: (value: UserFormState) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onUploadAvatar: (file: File) => Promise<string>;
}) {
	const isEdit = mode === "edit";
	const isSelf = isEdit && form.id === currentUserId;
	const availableRoleOptions = getAvailableRoleOptions(currentRole);
	const availableStatusOptions = getAvailableStatusOptions(isEdit);
	const title = isEdit ? "编辑用户" : "创建用户";
	const description = isEdit
		? "修改资料、角色、状态或重置密码。"
		: "创建可登录账号。";

	const updateField = <K extends keyof UserFormState>(
		key: K,
		value: UserFormState[K],
	) => {
		onChange({ ...form, [key]: value });
	};

	return (
		<Drawer>
			<Drawer.Backdrop
				isOpen={isOpen}
				onOpenChange={(open) => {
					if (!open) onCancel();
				}}
				variant="blur"
			>
				<Drawer.Content placement="right">
					<Drawer.Dialog aria-label={title} className="w-full sm:max-w-xl">
						<Drawer.CloseTrigger />
						<form id={userFormId} className="contents" onSubmit={onSubmit}>
							<Drawer.Header>
								<Drawer.Heading>{title}</Drawer.Heading>
								<p className="mt-1 text-muted text-sm">{description}</p>
							</Drawer.Header>
							<Drawer.Body>
								<div className="grid gap-4 sm:grid-cols-2">
									<TextInputField
										id="user-form-name"
										label="昵称"
										value={form.name}
										onChange={(value) => updateField("name", value)}
									/>
									<TextInputField
										id="user-form-email"
										label="邮箱"
										type="email"
										value={form.email}
										onChange={(value) => updateField("email", value)}
									/>
									<TextInputField
										id="user-form-password"
										label={isEdit ? "新密码" : "密码"}
										type="password"
										placeholder={isEdit ? "留空则不修改" : "至少 8 位"}
										value={form.password}
										onChange={(value) => updateField("password", value)}
									/>
									<SelectField
										id="user-form-role"
										label="角色"
										isDisabled={isSelf}
										value={form.role}
										options={availableRoleOptions.map((value) => ({
											label: userRoleLabel[value],
											value,
										}))}
										onChange={(value) => updateField("role", value)}
									/>
									<SelectField
										id="user-form-status"
										label="状态"
										isDisabled={isSelf}
										value={form.status}
										options={availableStatusOptions.map((value) => ({
											label: userStatusLabel[value],
											value,
										}))}
										onChange={(value) => updateField("status", value)}
									/>
									<SelectField
										id="user-form-gender"
										label="性别"
										value={form.gender}
										options={genderOptions.map((value) => ({
											label: genderLabel[value],
											value,
										}))}
										onChange={(value) => updateField("gender", value)}
									/>
									<TextInputField
										id="user-form-handle"
										label="用户名"
										placeholder="可选"
										value={form.handle}
										onChange={(value) => updateField("handle", value)}
									/>
									<AvatarUploadField
										label="头像"
										name={form.name}
										value={form.image}
										isUploading={isUploadingAvatar}
										onUpload={onUploadAvatar}
										onChange={(value) => updateField("image", value)}
									/>
								</div>
								<TextInputField
									id="user-form-bio"
									label="简介"
									placeholder="可选"
									value={form.bio}
									onChange={(value) => updateField("bio", value)}
								/>
								{formMessage ? (
									<p className="rounded-xl bg-danger-soft px-3 py-2 text-danger-soft-foreground text-sm">
										{formMessage}
									</p>
								) : null}
							</Drawer.Body>
							<Drawer.Footer>
								<Button type="submit" isPending={isSubmitting}>
									{isEdit ? "保存修改" : "创建用户"}
								</Button>
								<Button type="button" variant="tertiary" onPress={onCancel}>
									取消
								</Button>
							</Drawer.Footer>
						</form>
					</Drawer.Dialog>
				</Drawer.Content>
			</Drawer.Backdrop>
		</Drawer>
	);
}
