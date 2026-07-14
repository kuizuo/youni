import { useMutation, useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Outlet,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import type {
	AdminUserRole,
	AdminUserStatus,
} from "@youni/api/admin-user-governance";
import type { AdminUserListItem } from "@youni/api/contracts/admin";
import { env } from "@youni/env/web";
import type { FormEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import { AdminPage } from "@/components/admin-shell";
import { useUsersCollection } from "@/data/user-collection";
import { useAdminListWorkflow } from "@/lib/admin-list-workflow";
import { getUserManagementPermissions } from "@/lib/admin-permissions";
import { orpc } from "@/utils/orpc";

import {
	canManageItem,
	emptyForm,
	getErrorMessage,
	toGender,
	toUserRole,
	toUserStatus,
	type UserAccountType,
	type UserFormMode,
	type UserFormState,
} from "./-admin-users/types";
import { UserFilters } from "./-admin-users/user-filters";
import { UserFormDrawer } from "./-admin-users/user-form-drawer";
import { UserTable } from "./-admin-users/user-table";

export const Route = createFileRoute("/admin/users")({
	component: AdminUsersRoute,
});

function AdminUsersRoute() {
	const navigate = useNavigate();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const list = useAdminListWorkflow<AdminUserStatus>();
	const [accountTypeFilter, setAccountTypeFilter] = useState<
		UserAccountType | ""
	>("");
	const [formMode, setFormMode] = useState<UserFormMode>("create");
	const [form, setForm] = useState<UserFormState>(emptyForm);
	const [formMessage, setFormMessage] = useState<string | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const usersQueryInput = useMemo(
		() => ({
			...list.queryInput,
			accountType: accountTypeFilter || undefined,
		}),
		[accountTypeFilter, list.queryInput],
	);
	const users = useUsersCollection(usersQueryInput);
	const admin = useQuery(orpc.admin.me.queryOptions());
	const createMutation = useMutation(orpc.admin.createUser.mutationOptions());
	const updateMutation = useMutation(orpc.admin.updateUser.mutationOptions());
	const statusMutation = useMutation(
		orpc.admin.updateUserStatus.mutationOptions(),
	);
	const deleteMutation = useMutation(
		orpc.admin.softDeleteUser.mutationOptions(),
	);
	const restoreMutation = useMutation(orpc.admin.restoreUser.mutationOptions());

	const currentRole: AdminUserRole | undefined = admin.data?.role;
	const currentUserId = admin.data?.user.id;
	const userPermissions = getUserManagementPermissions(currentRole);
	const isSubmitting = createMutation.isPending || updateMutation.isPending;
	const isStatusBusy =
		statusMutation.isPending ||
		deleteMutation.isPending ||
		restoreMutation.isPending;
	const resetForm = useCallback(() => {
		setFormMode("create");
		setForm(emptyForm);
		setFormMessage(null);
	}, []);

	const openCreateDrawer = useCallback(() => {
		if (!userPermissions.canCreate) return;
		resetForm();
		setIsFormOpen(true);
	}, [resetForm, userPermissions.canCreate]);

	const closeFormDrawer = useCallback(() => {
		setIsFormOpen(false);
		resetForm();
	}, [resetForm]);

	const startEdit = useCallback(
		(item: AdminUserListItem) => {
			if (item.isAnonymous) return;
			if (!userPermissions.canUpdate) return;
			if (!canManageItem(currentRole, item.role)) return;
			setFormMode("edit");
			setForm({
				id: item.id,
				name: item.name,
				email: item.email,
				password: "",
				role: toUserRole(item.role),
				status: toUserStatus(item.status),
				image: item.image ?? "",
				handle: item.handle ?? "",
				bio: item.bio ?? "",
				gender: toGender(item.gender),
			});
			setFormMessage(null);
			setIsFormOpen(true);
		},
		[currentRole, userPermissions.canUpdate],
	);

	const refetchUsers = useCallback(async () => {
		await users.refetch();
	}, [users.refetch]);
	const updateAccountTypeFilter = useCallback(
		(value: UserAccountType | "") => {
			setAccountTypeFilter(value);
			list.resetPage();
		},
		[list],
	);

	const submitForm = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setFormMessage(null);

		if (!form.name.trim() || !form.email.trim()) {
			setFormMessage("请填写昵称和邮箱");
			return;
		}

		if (formMode === "create" && form.password.length < 8) {
			setFormMessage("新用户密码至少 8 位");
			return;
		}

		try {
			if (formMode === "create") {
				await createMutation.mutateAsync({
					name: form.name.trim(),
					email: form.email.trim(),
					password: form.password,
					role: form.role,
					status: form.status === "deleted" ? "disabled" : form.status,
					image: form.image.trim() || undefined,
					handle: form.handle.trim() || undefined,
					bio: form.bio.trim() || undefined,
					gender: form.gender,
				});
			} else if (form.id) {
				await updateMutation.mutateAsync({
					id: form.id,
					name: form.name.trim(),
					email: form.email.trim(),
					password: form.password || undefined,
					role: form.role,
					status: form.status,
					image: form.image.trim() || undefined,
					handle: form.handle.trim() || undefined,
					bio: form.bio.trim() || undefined,
					gender: form.gender,
				});
			}

			await refetchUsers();
			closeFormDrawer();
		} catch (error) {
			setFormMessage(getErrorMessage(error));
		}
	};

	const uploadAvatar = useCallback(async (file: File) => {
		setFormMessage(null);
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

	const updateStatus = useCallback(
		async (item: AdminUserListItem, status: AdminUserStatus) => {
			try {
				if (status === "deleted") {
					await deleteMutation.mutateAsync({ id: item.id });
				} else if (item.status === "deleted") {
					await restoreMutation.mutateAsync({ id: item.id, status });
				} else {
					await statusMutation.mutateAsync({ id: item.id, status });
				}
				await refetchUsers();
			} catch (error) {
				setFormMessage(getErrorMessage(error));
			}
		},
		[deleteMutation, refetchUsers, restoreMutation, statusMutation],
	);

	if (pathname !== "/admin/users") {
		return <Outlet />;
	}

	return (
		<AdminPage title="用户管理">
			<UserFilters
				accountTypeFilter={accountTypeFilter}
				canCreateUser={userPermissions.canCreate}
				keyword={list.keyword}
				statusFilter={list.statusFilter}
				onAccountTypeChange={updateAccountTypeFilter}
				onKeywordChange={list.updateKeyword}
				onCreateUser={openCreateDrawer}
				onStatusChange={list.updateStatusFilter}
			/>

			<UserFormDrawer
				currentRole={currentRole}
				currentUserId={currentUserId}
				form={form}
				formMessage={formMessage}
				isOpen={isFormOpen}
				isSubmitting={isSubmitting}
				isUploadingAvatar={isUploadingAvatar}
				mode={formMode}
				onCancel={closeFormDrawer}
				onChange={setForm}
				onSubmit={submitForm}
				onUploadAvatar={uploadAvatar}
			/>

			<UserTable
				canBanUsers={userPermissions.canBan}
				canDeleteUsers={userPermissions.canDelete}
				canRestoreUsers={userPermissions.canRestore}
				canUpdateUsers={userPermissions.canUpdate}
				currentRole={currentRole}
				currentUserId={currentUserId}
				isDeletePending={deleteMutation.isPending}
				isFetching={users.isInitialLoading}
				isStatusBusy={isStatusBusy}
				pagination={list.pagination}
				total={users.response?.total ?? 0}
				users={users.items}
				onEdit={startEdit}
				onOpenUser={(item) =>
					navigate({ to: "/admin/users/$userId", params: { userId: item.id } })
				}
				onPaginationChange={list.setPagination}
				onUpdateStatus={updateStatus}
			/>
		</AdminPage>
	);
}
