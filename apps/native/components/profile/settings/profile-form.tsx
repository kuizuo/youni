import { Ionicons } from "@expo/vector-icons";
import { useForm, useStore } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import {
	type ProfileUser,
	profileUpdateInput,
} from "@youni/api/contracts/profiles";
import type { UserGender } from "@youni/api/contracts/shared";
import {
	Button,
	FieldError,
	Input,
	Label,
	Spinner,
	Surface,
	TextArea,
	TextField,
	Typography,
	useThemeColor,
} from "heroui-native";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { z } from "zod";
import { EditableAvatar } from "@/components/profile/editable-avatar";
import type { AuthUser } from "@/lib/auth-client";
import { submitProfileMedia } from "@/lib/profile-media-submission";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

import { GenderSelector } from "./gender-selector";
import { shouldReplaceProfileDraft } from "./profile-form-state";

const profileFormSchema = profileUpdateInput.extend({
	name: z.string().trim().min(1, "请输入昵称").max(50, "昵称最多 50 个字符"),
	handle: z
		.string()
		.trim()
		.min(2, "用户名至少 2 个字符")
		.max(30, "用户名最多 30 个字符")
		.regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线")
		.optional()
		.or(z.literal("")),
	bio: z.string().trim().max(160, "简介最多 160 个字符").optional(),
});

export function SettingsProfileForm({
	displayName,
	isLoadingProfile,
	profile,
	user,
	onProfileSaved,
}: {
	displayName: string;
	isLoadingProfile: boolean;
	profile?: ProfileUser;
	user?: AuthUser;
	onProfileSaved: () => Promise<unknown>;
}) {
	const { toast } = useAppToast();
	const mutedColor = useThemeColor("muted");
	const accentForegroundColor = useThemeColor("accent-foreground");
	const [avatarUrl, setAvatarUrl] = useState("");
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const loadedUserIdRef = useRef<string | undefined>(undefined);

	const updateProfile = useMutation(
		orpc.profiles.updateProfile.mutationOptions(),
	);
	const form = useForm({
		defaultValues: {
			name: "",
			handle: "",
			bio: "",
			gender: "unknown" as UserGender,
		} as z.input<typeof profileFormSchema>,
		validators: {
			onSubmit: profileFormSchema,
		},
		onSubmit: async ({ value }) => {
			const parsed = profileFormSchema.parse(value);
			try {
				await updateProfile.mutateAsync(parsed);
				form.reset({
					name: parsed.name,
					handle: parsed.handle ?? "",
					bio: parsed.bio ?? "",
					gender: parsed.gender,
				});
				await onProfileSaved();
				await queryClient.refetchQueries();
				toast.show({ variant: "success", label: "个人资料已保存" });
			} catch (error) {
				if (isRequestTimeoutError(error)) return;
				toast.show({
					variant: "danger",
					label: error instanceof Error ? error.message : "个人资料保存失败",
				});
			}
		},
	});
	const hasUnsavedChanges = useStore(form.store, (state) => state.isDirty);
	const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
	const name = useStore(form.store, (state) => state.values.name);

	useEffect(() => {
		const nextUserId = profile?.id ?? user?.id;
		if (
			!shouldReplaceProfileDraft({
				hasUnsavedChanges,
				loadedUserId: loadedUserIdRef.current,
				nextUserId,
			})
		) {
			return;
		}

		loadedUserIdRef.current = nextUserId;
		form.reset({
			name: profile?.name ?? user?.name ?? "",
			handle: profile?.handle ?? "",
			bio: profile?.bio ?? "",
			gender:
				profile?.gender === "male" || profile?.gender === "female"
					? profile.gender
					: "unknown",
		});
		setAvatarUrl(profile?.image ?? user?.image ?? "");
	}, [form, hasUnsavedChanges, profile, user]);

	const saveProfile = () => {
		fireHaptic();
		void form.handleSubmit();
	};

	const chooseAvatar = async () => {
		fireHaptic();
		setIsUploadingAvatar(true);
		try {
			const updated = await submitProfileMedia("avatar");
			if (updated) setAvatarUrl(updated.image ?? "");
		} catch (error) {
			if (isRequestTimeoutError(error)) return;
			toast.show({
				variant: "danger",
				label: error instanceof Error ? error.message : "头像上传失败",
			});
		} finally {
			setIsUploadingAvatar(false);
		}
	};

	return (
		<Surface className="gap-4 rounded-3xl p-4">
			<View className="flex-row items-center justify-between gap-3">
				<View className="min-w-0 flex-1">
					<Typography.Paragraph weight="bold">个人资料</Typography.Paragraph>
				</View>
				<EditableAvatar
					alt={name || displayName}
					image={avatarUrl}
					initial={(name || displayName).slice(0, 1)}
					isDisabled={isSubmitting}
					isUploading={isUploadingAvatar}
					onPress={chooseAvatar}
				/>
			</View>

			<form.Field name="name">
				{(field) => {
					const fieldError = field.state.meta.errors[0]?.message;
					return (
						<TextField isRequired isInvalid={Boolean(fieldError)}>
							<Label>昵称</Label>
							<Input
								value={field.state.value ?? ""}
								onBlur={field.handleBlur}
								onChangeText={field.handleChange}
								placeholder="你的昵称"
								placeholderTextColor={mutedColor}
							/>
							<FieldError>{fieldError}</FieldError>
						</TextField>
					);
				}}
			</form.Field>

			<form.Field name="handle">
				{(field) => {
					const fieldError = field.state.meta.errors[0]?.message;
					return (
						<TextField isInvalid={Boolean(fieldError)}>
							<Label>用户名</Label>
							<Input
								value={field.state.value ?? ""}
								onBlur={field.handleBlur}
								onChangeText={field.handleChange}
								autoCapitalize="none"
								placeholder="letters_and_numbers"
								placeholderTextColor={mutedColor}
							/>
							<FieldError>{fieldError}</FieldError>
						</TextField>
					);
				}}
			</form.Field>

			<form.Field name="bio">
				{(field) => {
					const fieldError = field.state.meta.errors[0]?.message;
					return (
						<TextField isInvalid={Boolean(fieldError)}>
							<Label>简介</Label>
							<TextArea
								value={field.state.value ?? ""}
								onBlur={field.handleBlur}
								onChangeText={field.handleChange}
								placeholder="一句话介绍你分享的内容"
								placeholderTextColor={mutedColor}
								className="min-h-24"
								maxLength={160}
							/>
							<FieldError>{fieldError}</FieldError>
						</TextField>
					);
				}}
			</form.Field>

			<form.Field name="gender">
				{(field) => (
					<GenderSelector
						value={field.state.value ?? "unknown"}
						onChange={field.handleChange}
					/>
				)}
			</form.Field>

			<Button
				variant="primary"
				className="rounded-full"
				feedbackVariant="scale-ripple"
				isDisabled={
					isSubmitting ||
					isUploadingAvatar ||
					isLoadingProfile ||
					!hasUnsavedChanges
				}
				onPress={saveProfile}
			>
				{isSubmitting ? (
					<Spinner size="sm" color={accentForegroundColor} />
				) : (
					<Ionicons
						name="checkmark-outline"
						size={18}
						color={accentForegroundColor}
					/>
				)}
				<Button.Label>{isSubmitting ? "保存中" : "保存资料"}</Button.Label>
			</Button>
		</Surface>
	);
}
