import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import type { ProfileUser } from "@youni/api/contracts/profiles";
import type { UserGender } from "@youni/api/contracts/shared";
import {
	Button,
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
import { EditableAvatar } from "@/components/profile/editable-avatar";
import type { AuthUser } from "@/lib/auth-client";
import { submitProfileMedia } from "@/lib/profile-media-submission";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

import { GenderSelector } from "./gender-selector";
import { shouldReplaceProfileDraft } from "./profile-form-state";

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
	const [name, setName] = useState("");
	const [handle, setHandle] = useState("");
	const [bio, setBio] = useState("");
	const [avatarUrl, setAvatarUrl] = useState("");
	const [gender, setGender] = useState<UserGender>("unknown");
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const loadedUserIdRef = useRef<string | undefined>(undefined);

	useEffect(() => {
		const nextUserId = profile?.id ?? user?.id;
		const userChanged = loadedUserIdRef.current !== nextUserId;
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
		setName(profile?.name ?? user?.name ?? "");
		setHandle(profile?.handle ?? "");
		setBio(profile?.bio ?? "");
		setAvatarUrl(profile?.image ?? user?.image ?? "");
		setGender(
			profile?.gender === "male" || profile?.gender === "female"
				? profile.gender
				: "unknown",
		);
		if (userChanged) setHasUnsavedChanges(false);
	}, [hasUnsavedChanges, profile, user]);

	const updateProfile = useMutation(
		orpc.profiles.updateProfile.mutationOptions({
			onSuccess: async () => {
				await onProfileSaved();
				await queryClient.refetchQueries();
				setHasUnsavedChanges(false);
				toast.show({ variant: "success", label: "个人资料已保存" });
			},
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({
					variant: "danger",
					label: error.message,
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
			gender,
		});
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
					isDisabled={updateProfile.isPending}
					isUploading={isUploadingAvatar}
					onPress={chooseAvatar}
				/>
			</View>

			<TextField isRequired>
				<Label>昵称</Label>
				<Input
					value={name}
					onChangeText={(value) => {
						setName(value);
						setHasUnsavedChanges(true);
					}}
					placeholder="你的昵称"
					placeholderTextColor={mutedColor}
				/>
			</TextField>

			<TextField>
				<Label>用户名</Label>
				<Input
					value={handle}
					onChangeText={(value) => {
						setHandle(value);
						setHasUnsavedChanges(true);
					}}
					autoCapitalize="none"
					placeholder="letters_and_numbers"
					placeholderTextColor={mutedColor}
				/>
			</TextField>

			<TextField>
				<Label>简介</Label>
				<TextArea
					value={bio}
					onChangeText={(value) => {
						setBio(value);
						setHasUnsavedChanges(true);
					}}
					placeholder="一句话介绍你分享的内容"
					placeholderTextColor={mutedColor}
					className="min-h-24"
					maxLength={160}
				/>
			</TextField>

			<GenderSelector
				value={gender}
				onChange={(value) => {
					setGender(value);
					setHasUnsavedChanges(true);
				}}
			/>

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
