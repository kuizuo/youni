import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import {
	Button,
	Input,
	Label,
	Spinner,
	Surface,
	Text,
	TextArea,
	TextField,
	useThemeColor,
} from "heroui-native";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { EditableAvatar } from "@/components/profile/editable-avatar";
import { pickAndUploadAvatar } from "@/lib/avatar-upload";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

import { GenderSelector, type GenderValue } from "./gender-selector";
import type { SettingsProfile, SettingsUser } from "./types";

export function SettingsProfileForm({
	displayName,
	isLoadingProfile,
	profile,
	user,
	onProfileSaved,
}: {
	displayName: string;
	isLoadingProfile: boolean;
	profile?: SettingsProfile;
	user?: SettingsUser;
	onProfileSaved: () => Promise<unknown>;
}) {
	const { toast } = useAppToast();
	const mutedColor = useThemeColor("muted");
	const accentForegroundColor = useThemeColor("accent-foreground");
	const [name, setName] = useState("");
	const [handle, setHandle] = useState("");
	const [bio, setBio] = useState("");
	const [avatarUrl, setAvatarUrl] = useState("");
	const [gender, setGender] = useState<GenderValue>("unknown");
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

	useEffect(() => {
		if (!profile) return;
		setName(profile.name ?? "");
		setHandle(profile.handle ?? "");
		setBio(profile.bio ?? "");
		setAvatarUrl(profile.image ?? user?.image ?? "");
		setGender(
			profile.gender === "male" || profile.gender === "female"
				? profile.gender
				: "unknown",
		);
	}, [profile, user]);

	const updateProfile = useMutation(
		orpc.updateProfile.mutationOptions({
			onSuccess: async () => {
				await onProfileSaved();
				await queryClient.refetchQueries();
				toast.show({ variant: "success", label: "资料已保存" });
			},
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({
					variant: "danger",
					label: "保存失败",
					description: error.message,
				});
			},
		}),
	);

	const saveProfile = () => {
		fireHaptic();
		if (!name.trim()) {
			toast.show({ variant: "warning", label: "请输入昵称" });
			return;
		}

		updateProfile.mutate({
			name: name.trim(),
			handle: handle.trim(),
			bio: bio.trim(),
			image: avatarUrl.trim(),
			gender,
		});
	};

	const chooseAvatar = async () => {
		fireHaptic();
		setIsUploadingAvatar(true);
		try {
			const uploaded = await pickAndUploadAvatar();
			if (uploaded) {
				setAvatarUrl(uploaded.url);
				toast.show({ variant: "success", label: "头像已上传，保存后生效" });
			}
		} catch (error) {
			if (isRequestTimeoutError(error)) return;
			toast.show({
				variant: "danger",
				label: "头像上传失败",
				description: error instanceof Error ? error.message : undefined,
			});
		} finally {
			setIsUploadingAvatar(false);
		}
	};

	return (
		<Surface className="gap-4 rounded-3xl p-4">
			<View className="flex-row items-center justify-between gap-3">
				<View className="min-w-0 flex-1">
					<Text.Paragraph weight="bold">编辑主页</Text.Paragraph>
				</View>
				<EditableAvatar
					alt={name || displayName}
					image={avatarUrl}
					initial={(name || displayName).slice(0, 1)}
					isDisabled={updateProfile.isPending}
					isUploading={isUploadingAvatar}
					onPress={chooseAvatar}
				/>
			</View>

			<TextField isRequired>
				<Label>昵称</Label>
				<Input
					value={name}
					onChangeText={setName}
					placeholder="你的昵称"
					placeholderTextColor={mutedColor}
				/>
			</TextField>

			<TextField>
				<Label>用户名</Label>
				<Input
					value={handle}
					onChangeText={setHandle}
					autoCapitalize="none"
					placeholder="letters_and_numbers"
					placeholderTextColor={mutedColor}
				/>
			</TextField>

			<TextField>
				<Label>简介</Label>
				<TextArea
					value={bio}
					onChangeText={setBio}
					placeholder="一句话介绍你分享的内容"
					placeholderTextColor={mutedColor}
					className="min-h-24"
					maxLength={160}
				/>
			</TextField>

			<GenderSelector value={gender} onChange={setGender} />

			<Button
				variant="primary"
				className="rounded-full"
				feedbackVariant="scale-ripple"
				isDisabled={
					updateProfile.isPending || isUploadingAvatar || isLoadingProfile
				}
				onPress={saveProfile}
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
		</Surface>
	);
}
