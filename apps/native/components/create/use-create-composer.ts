import { useMutation, useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import type { Href } from "expo-router";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { uploadNoteImages } from "@/lib/note-image-upload";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

type NoteVisibility = "followers" | "private" | "public";
type PublishSubmitMode = "draft" | "publish";
export type ComposerImage = {
	asset?: ImagePicker.ImagePickerAsset;
	id: string;
	remoteUrl?: string;
	uri: string;
};
type AdvancedOptions = {
	allowComment: boolean;
	allowShare: boolean;
};

const DEFAULT_ADVANCED_OPTIONS: AdvancedOptions = {
	allowComment: true,
	allowShare: true,
};

function extractTopicsFromContent(value: string) {
	const topics = new Set<string>();
	const matches = value.matchAll(/(?:^|\s)#([^\s#@]{1,24})/g);
	for (const match of matches) {
		const topic = match[1]?.trim();
		if (topic) topics.add(topic);
		if (topics.size >= 8) break;
	}
	return [...topics];
}

function mergeTopics(...topicGroups: string[][]) {
	const topics = new Set<string>();
	for (const group of topicGroups) {
		for (const topic of group) {
			const cleanTopic = topic.replace(/^#/, "").trim();
			if (cleanTopic) topics.add(cleanTopic);
			if (topics.size >= 8) return [...topics];
		}
	}
	return [...topics];
}

type UseCreateComposerOptions = {
	onRequestClose?: () => void;
};

export function useCreateComposer({
	onRequestClose,
}: UseCreateComposerOptions) {
	const params = useLocalSearchParams<{ draftId?: string | string[] }>();
	const session = authClient.useSession();
	const { toast } = useAppToast();
	const [hasAuthenticated, setHasAuthenticated] = useState(false);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [images, setImages] = useState<ComposerImage[]>([]);
	const [topics, setTopics] = useState<string[]>([]);
	const [visibility, setVisibility] = useState<NoteVisibility>("public");
	const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptions>(
		DEFAULT_ADVANCED_OPTIONS,
	);
	const [pendingSubmitMode, setPendingSubmitMode] =
		useState<PublishSubmitMode | null>(null);
	const [isUploadingImages, setIsUploadingImages] = useState(false);
	const [hydratedDraftId, setHydratedDraftId] = useState<null | string>(null);
	const rawDraftId = params.draftId;
	const draftId = Array.isArray(rawDraftId) ? rawDraftId[0] : rawDraftId;
	const isEditingDraft = Boolean(draftId);
	const isAuthenticated = Boolean(session.data?.user) || hasAuthenticated;

	useEffect(() => {
		if (session.data?.user) {
			setHasAuthenticated(true);
		}
	}, [session.data?.user]);

	const missingItems = useMemo(
		() =>
			[
				images.length === 0 ? "图片" : null,
				title.trim().length === 0 ? "标题" : null,
				content.trim().length === 0 ? "正文" : null,
				topics.length === 0 ? "话题" : null,
			].filter((item): item is string => Boolean(item)),
		[content, images.length, title, topics.length],
	);
	const canPublish = missingItems.length === 0;
	const visibilityLabel =
		visibility === "public"
			? "公开可见"
			: visibility === "followers"
				? "仅关注者可见"
				: "仅自己可见";
	const advancedLabel = advancedOptions.allowComment ? "评论开启" : "评论关闭";
	const draftQuery = useQuery({
		...orpc.draftById.queryOptions({
			input: { id: draftId || "missing" },
		}),
		enabled: Boolean(draftId && isAuthenticated),
	});

	const resetForm = () => {
		setTitle("");
		setContent("");
		setImages([]);
		setTopics([]);
		setVisibility("public");
		setAdvancedOptions(DEFAULT_ADVANCED_OPTIONS);
		setHydratedDraftId(null);
	};

	const createMutation = useMutation(
		orpc.create.mutationOptions({
			onSuccess: async (result, variables) => {
				resetForm();
				await queryClient.invalidateQueries();
				const isDraft = variables.submitMode === "draft";
				toast.show({
					variant: "success",
					label: isDraft ? "已保存草稿" : "已提交审核",
					description: isDraft
						? "草稿已保存到你的主页。"
						: "可以先查看这篇内容。",
				});
				router.replace((isDraft ? "/me" : `/note/${result.id}`) as Href);
			},
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({
					variant: "danger",
					label: "发布失败",
					description: error.message,
				});
			},
			onSettled: () => {
				setPendingSubmitMode(null);
			},
		}),
	);
	const updateDraftMutation = useMutation(
		orpc.updateDraft.mutationOptions({
			onSuccess: async (result, variables) => {
				resetForm();
				await queryClient.invalidateQueries();
				const isDraft = variables.submitMode === "draft";
				toast.show({
					variant: "success",
					label: isDraft ? "草稿已保存" : "已提交审核",
					description: isDraft
						? "修改已保存到我的草稿。"
						: "可以先查看这篇内容。",
				});
				router.replace((isDraft ? "/drafts" : `/note/${result.id}`) as Href);
			},
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({
					variant: "danger",
					label: pendingSubmitMode === "draft" ? "保存失败" : "发布失败",
					description: error.message,
				});
			},
			onSettled: () => {
				setPendingSubmitMode(null);
			},
		}),
	);

	useEffect(() => {
		if (!draftId || !draftQuery.data || hydratedDraftId === draftId) return;
		setTitle(draftQuery.data.title ?? "");
		const draftContent = draftQuery.data.content ?? "";
		setContent(draftContent);
		setImages(
			(draftQuery.data.images ?? []).map((url) => ({
				id: url,
				remoteUrl: url,
				uri: url,
			})),
		);
		setTopics(
			mergeTopics(
				draftQuery.data.topics ?? [],
				extractTopicsFromContent(draftContent),
			),
		);
		setVisibility(draftQuery.data.visibility ?? "public");
		setAdvancedOptions({
			allowComment:
				draftQuery.data.advancedOptions.allowComment ??
				DEFAULT_ADVANCED_OPTIONS.allowComment,
			allowShare:
				draftQuery.data.advancedOptions.allowShare ??
				DEFAULT_ADVANCED_OPTIONS.allowShare,
		});
		setHydratedDraftId(draftId);
	}, [draftId, draftQuery.data, hydratedDraftId]);

	const uploadLocalImages = async () => {
		const localAssets = images.flatMap((image) =>
			image.remoteUrl || !image.asset ? [] : [image.asset],
		);
		if (localAssets.length === 0) {
			return images.map((image) => image.remoteUrl ?? image.uri);
		}

		setIsUploadingImages(true);
		try {
			const uploaded = await uploadNoteImages(localAssets);
			let uploadedIndex = 0;
			const nextImages = images.map((image) => {
				if (image.remoteUrl) return image;
				const item = uploaded[uploadedIndex];
				uploadedIndex += 1;
				if (!item) {
					throw new Error("图片上传失败");
				}
				return {
					id: item.url,
					remoteUrl: item.url,
					uri: item.url,
				};
			});
			setImages(nextImages);
			return nextImages.map((image) => image.remoteUrl ?? image.uri);
		} finally {
			setIsUploadingImages(false);
		}
	};

	const buildPayload = async (submitMode: PublishSubmitMode) => ({
		title: title.trim(),
		content: content.trim(),
		images: await uploadLocalImages(),
		topics,
		locationName: undefined,
		visibility,
		components: [],
		advancedOptions,
		submitMode,
	});
	const isSubmitting =
		createMutation.isPending ||
		updateDraftMutation.isPending ||
		isUploadingImages;

	const submitNote = async (submitMode: PublishSubmitMode) => {
		try {
			const payload = await buildPayload(submitMode);
			if (draftId) {
				updateDraftMutation.mutate({ id: draftId, ...payload });
				return;
			}
			createMutation.mutate(payload);
		} catch (error) {
			if (isRequestTimeoutError(error)) return;
			setPendingSubmitMode(null);
			toast.show({
				variant: "danger",
				label: submitMode === "draft" ? "保存失败" : "发布失败",
				description: error instanceof Error ? error.message : "图片上传失败",
			});
		}
	};

	const goBack = () => {
		fireHaptic();
		if (onRequestClose) {
			onRequestClose();
			return;
		}
		router.replace((draftId ? "/drafts" : "/") as Href);
	};

	const addImage = async () => {
		fireHaptic();
		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (!permission.granted) {
			toast.show({
				variant: "warning",
				label: "需要允许访问相册",
				description: "允许后才能选择图片发布。",
			});
			return;
		}

		const remaining = Math.max(0, 9 - images.length);
		if (remaining === 0) {
			toast.show({ variant: "warning", label: "最多只能选择 9 张图片" });
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			allowsEditing: false,
			allowsMultipleSelection: true,
			mediaTypes: "images",
			orderedSelection: true,
			quality: 0.92,
			selectionLimit: remaining,
		});

		if (result.canceled) {
			return;
		}

		setImages((current) =>
			[
				...current,
				...result.assets.map((asset) => ({
					asset,
					id: `${asset.assetId ?? asset.uri}-${asset.uri}`,
					uri: asset.uri,
				})),
			].slice(0, 9),
		);
	};

	const removeImage = (id: string) => {
		fireHaptic();
		setImages((current) => current.filter((item) => item.id !== id));
	};

	const setComposerContent = (value: string) => {
		setContent(value);
		setTopics(extractTopicsFromContent(value));
	};

	const toggleTopic = (topic: string) => {
		fireHaptic();
		const cleanTopic = topic.replace(/^#/, "").trim();
		if (!cleanTopic) return;
		setTopics((current) =>
			current.includes(cleanTopic)
				? current.filter((item) => item !== cleanTopic)
				: [...current, cleanTopic].slice(0, 8),
		);
	};

	const insertMention = (label: string) => {
		fireHaptic();
		const cleanLabel = label.replace(/^@/, "").trim();
		if (!cleanLabel) return;
		setContent((current) => {
			const prefix = current.trimEnd();
			return `${prefix}${prefix ? " " : ""}@${cleanLabel} `;
		});
	};

	const saveDraft = () => {
		fireHaptic();
		if (isSubmitting) return;
		if (!isAuthenticated) {
			toast.show({
				variant: "warning",
				label: "登录后再保存",
				description: "请先登录账号，再保存草稿。",
			});
			return;
		}
		setPendingSubmitMode("draft");
		void submitNote("draft");
	};

	const publish = () => {
		fireHaptic();
		if (isSubmitting) return;

		if (!isAuthenticated) {
			toast.show({
				variant: "warning",
				label: "登录后再发布",
				description: "请先登录账号，再提交笔记。",
			});
			return;
		}

		if (!canPublish) {
			toast.show({
				variant: "warning",
				label: "还不能发布",
				description: `还差：${missingItems.join("、")}`,
			});
			return;
		}

		setPendingSubmitMode("publish");
		void submitNote("publish");
	};

	const cycleVisibility = () => {
		fireHaptic();
		setVisibility((value) => {
			if (value === "public") return "followers";
			if (value === "followers") return "private";
			return "public";
		});
	};

	const setAllowComment = (value: boolean) => {
		fireHaptic();
		setAdvancedOptions((current) => ({
			...current,
			allowComment: value,
		}));
	};

	const setAllowShare = (value: boolean) => {
		fireHaptic();
		setAdvancedOptions((current) => ({
			...current,
			allowShare: value,
		}));
	};

	return {
		advancedLabel,
		advancedOptions,
		addImage,
		content,
		cycleVisibility,
		draftQuery,
		goBack,
		images,
		isEditingDraft,
		isSubmitting,
		isUploadingImages,
		pendingSubmitMode,
		publish,
		removeImage,
		saveDraft,
		setAllowComment,
		setAllowShare,
		setContent: setComposerContent,
		setTitle,
		title,
		insertMention,
		toggleTopic,
		topics,
		visibilityLabel,
	};
}
