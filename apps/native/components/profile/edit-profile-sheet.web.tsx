import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import type { ProfileUser } from "@youni/api/contracts/profiles";
import type { UserGender } from "@youni/api/contracts/shared";
import { Button, Spinner, Typography, useThemeColor } from "heroui-native";
import { useEffect, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";

import { EditableAvatar } from "@/components/profile/editable-avatar";
import type { AuthUser } from "@/lib/auth-client";
import { pickAndUploadAvatar } from "@/lib/avatar-upload";
import { useAppToast } from "@/utils/app-toast";
import { orpc } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

export function EditProfileSheet({
	displayName,
	onSaved,
	profile,
	user,
}: {
	displayName: string;
	onSaved: () => Promise<void>;
	profile?: ProfileUser;
	user?: AuthUser;
}) {
	const { toast } = useAppToast();
	const accentForegroundColor = useThemeColor("accent-foreground");
	const fieldBackgroundColor = useThemeColor("surface-secondary");
	const fieldBorderColor = useThemeColor("field-border");
	const foregroundColor = useThemeColor("foreground");
	const mutedColor = useThemeColor("muted");
	const [name, setName] = useState("");
	const [handle, setHandle] = useState("");
	const [bio, setBio] = useState("");
	const [avatarUrl, setAvatarUrl] = useState("");
	const [gender, setGender] = useState<UserGender>("unknown");
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const updateProfile = useMutation(
		orpc.profiles.updateProfile.mutationOptions({
			onSuccess: onSaved,
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger", label: error.message });
			},
		}),
	);

	useEffect(() => {
		setName(profile?.name ?? user?.name ?? "");
		setHandle(profile?.handle ?? "");
		setBio(profile?.bio ?? "");
		setAvatarUrl(profile?.image ?? user?.image ?? "");
		setGender(
			profile?.gender === "male" || profile?.gender === "female"
				? profile.gender
				: "unknown",
		);
	}, [profile, user]);

	const chooseAvatar = async () => {
		setIsUploadingAvatar(true);
		try {
			const uploaded = await pickAndUploadAvatar();
			if (uploaded) setAvatarUrl(uploaded.url);
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

	const saveProfile = () => {
		if (!name.trim()) {
			toast.show({ variant: "warning", label: "请输入昵称" });
			return;
		}
		updateProfile.mutate({
			bio: bio.trim(),
			gender,
			handle: handle.trim(),
			image: avatarUrl.trim(),
			name: name.trim(),
		});
	};

	const inputStyle = {
		backgroundColor: fieldBackgroundColor,
		borderColor: fieldBorderColor,
		borderRadius: 16,
		borderWidth: 1,
		color: foregroundColor,
		fontSize: 16,
		minHeight: 48,
		paddingHorizontal: 14,
		paddingVertical: 12,
	};

	return (
		<ScrollView
			className="flex-1"
			contentContainerClassName="gap-4 p-5"
			keyboardShouldPersistTaps="handled"
		>
			<View className="flex-row items-center gap-3">
				<EditableAvatar
					alt={name || displayName}
					image={avatarUrl}
					initial={(name || displayName).slice(0, 1)}
					isDisabled={updateProfile.isPending}
					isUploading={isUploadingAvatar}
					onPress={chooseAvatar}
				/>
				<View className="min-w-0 flex-1">
					<Typography.Paragraph weight="bold" numberOfLines={1}>
						{name || displayName}
					</Typography.Paragraph>
					<Typography.Paragraph type="body-sm" color="muted" numberOfLines={1}>
						{handle ? `@${handle}` : "设置公开资料"}
					</Typography.Paragraph>
				</View>
			</View>

			<WebField label="昵称" required>
				<TextInput
					accessibilityLabel="昵称"
					onChangeText={setName}
					placeholder="你的昵称"
					placeholderTextColor={mutedColor}
					style={inputStyle}
					value={name}
				/>
			</WebField>

			<WebField label="用户名">
				<TextInput
					accessibilityLabel="用户名"
					autoCapitalize="none"
					onChangeText={setHandle}
					placeholder="letters_and_numbers"
					placeholderTextColor={mutedColor}
					style={inputStyle}
					value={handle}
				/>
			</WebField>

			<WebField label="简介">
				<TextInput
					accessibilityLabel="简介"
					maxLength={160}
					multiline
					onChangeText={setBio}
					placeholder="一句话介绍你分享的内容"
					placeholderTextColor={mutedColor}
					style={[inputStyle, { minHeight: 96, textAlignVertical: "top" }]}
					value={bio}
				/>
			</WebField>

			<View className="gap-2">
				<Typography.Paragraph type="body-sm" weight="semibold">
					性别
				</Typography.Paragraph>
				<View className="flex-row rounded-full bg-content2 p-1">
					{(
						[
							["unknown", "不展示"],
							["female", "女"],
							["male", "男"],
						] as const
					).map(([value, label]) => (
						<Button
							className="h-9 flex-1 rounded-full"
							feedbackVariant="scale"
							key={value}
							onPress={() => setGender(value)}
							size="sm"
							variant={gender === value ? "primary" : "ghost"}
						>
							<Button.Label>{label}</Button.Label>
						</Button>
					))}
				</View>
			</View>

			<Button
				className="rounded-full"
				feedbackVariant="scale"
				isDisabled={updateProfile.isPending || isUploadingAvatar}
				onPress={saveProfile}
				variant="primary"
			>
				{updateProfile.isPending ? (
					<Spinner size="sm" color={accentForegroundColor} />
				) : (
					<Ionicons
						name="checkmark-outline"
						size={18}
						color={accentForegroundColor}
					/>
				)}
				<Button.Label>
					{updateProfile.isPending ? "保存中" : "保存资料"}
				</Button.Label>
			</Button>
		</ScrollView>
	);
}

function WebField({
	children,
	label,
	required = false,
}: {
	children: React.ReactNode;
	label: string;
	required?: boolean;
}) {
	return (
		<View className="gap-2">
			<Typography.Paragraph type="body-sm" weight="semibold">
				{label}
				{required ? " *" : ""}
			</Typography.Paragraph>
			{children}
		</View>
	);
}
