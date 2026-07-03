import { useMutation, useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

const SAMPLE_IMAGES = [
	"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
	"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
	"https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80",
	"https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80",
];

type NoteVisibility = "followers" | "private" | "public";
type PublishSubmitMode = "draft" | "publish";
type NoteComponent = {
	options?: string[];
	title: string;
	type: "file" | "poll";
	value?: string;
};
type AdvancedOptions = {
	allowComment: boolean;
	allowShare: boolean;
	contentDisclosure?: string;
	isOriginal: boolean;
};

const DEFAULT_ADVANCED_OPTIONS: AdvancedOptions = {
	allowComment: true,
	allowShare: true,
	isOriginal: true,
};

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
	const [imageUrls, setImageUrls] = useState<string[]>([]);
	const [topics, setTopics] = useState<string[]>([]);
	const [locationName, setLocationName] = useState("");
	const [visibility, setVisibility] = useState<NoteVisibility>("public");
	const [components, setComponents] = useState<NoteComponent[]>([]);
	const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptions>(
		DEFAULT_ADVANCED_OPTIONS,
	);
	const [pendingSubmitMode, setPendingSubmitMode] =
		useState<PublishSubmitMode | null>(null);
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
				imageUrls.length === 0 ? "图片" : null,
				title.trim().length === 0 ? "标题" : null,
				content.trim().length === 0 ? "正文" : null,
				topics.length === 0 ? "话题" : null,
			].filter((item): item is string => Boolean(item)),
		[content, imageUrls.length, title, topics.length],
	);
	const canPublish = missingItems.length === 0;
	const visibilityLabel =
		visibility === "public"
			? "公开可见"
			: visibility === "followers"
				? "仅关注者可见"
				: "仅自己可见";
	const componentLabel =
		components.length > 0 ? `已添加 ${components.length} 个` : "可添加文件";
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
		setImageUrls([]);
		setTopics([]);
		setLocationName("");
		setVisibility("public");
		setComponents([]);
		setAdvancedOptions(DEFAULT_ADVANCED_OPTIONS);
		setHydratedDraftId(null);
	};

	const createMutation = useMutation(
		orpc.create.mutationOptions({
			onSuccess: async (_result, variables) => {
				resetForm();
				await queryClient.refetchQueries();
				const isDraft = variables.submitMode === "draft";
				toast.show({
					variant: "success",
					label: isDraft ? "已保存草稿" : "已提交审核",
					description: isDraft
						? "草稿已保存到你的主页。"
						: "审核通过后会出现在发现页。",
				});
				router.replace("/me" as Href);
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
			onSuccess: async (_result, variables) => {
				resetForm();
				await queryClient.refetchQueries();
				const isDraft = variables.submitMode === "draft";
				toast.show({
					variant: "success",
					label: isDraft ? "草稿已保存" : "已提交审核",
					description: isDraft
						? "修改已保存到我的草稿。"
						: "审核通过后会出现在发现页。",
				});
				router.replace((isDraft ? "/drafts" : "/me") as Href);
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
		setContent(draftQuery.data.content ?? "");
		setImageUrls(draftQuery.data.images ?? []);
		setTopics(draftQuery.data.topics ?? []);
		setLocationName(draftQuery.data.locationName ?? "");
		setVisibility(draftQuery.data.visibility ?? "public");
		setComponents(draftQuery.data.components ?? []);
		setAdvancedOptions({
			...DEFAULT_ADVANCED_OPTIONS,
			...draftQuery.data.advancedOptions,
			contentDisclosure:
				draftQuery.data.advancedOptions.contentDisclosure ?? undefined,
		});
		setHydratedDraftId(draftId);
	}, [draftId, draftQuery.data, hydratedDraftId]);

	const buildPayload = (submitMode: PublishSubmitMode) => ({
		title: title.trim(),
		content: content.trim(),
		images: imageUrls,
		topics,
		locationName: locationName || undefined,
		visibility,
		components,
		advancedOptions,
		submitMode,
	});
	const isSubmitting =
		createMutation.isPending || updateDraftMutation.isPending;

	const submitNote = (submitMode: PublishSubmitMode) => {
		const payload = buildPayload(submitMode);
		if (draftId) {
			updateDraftMutation.mutate({ id: draftId, ...payload });
			return;
		}
		createMutation.mutate(payload);
	};

	const goBack = () => {
		fireHaptic();
		if (onRequestClose) {
			onRequestClose();
			return;
		}
		router.replace((draftId ? "/drafts" : "/") as Href);
	};

	const addImage = () => {
		fireHaptic();
		const nextImage = SAMPLE_IMAGES[imageUrls.length % SAMPLE_IMAGES.length];
		setImageUrls((current) =>
			current.includes(nextImage)
				? current
				: [...current, nextImage].slice(0, 9),
		);
	};

	const removeImage = (url: string) => {
		fireHaptic();
		setImageUrls((current) => current.filter((item) => item !== url));
	};

	const toggleTopic = (topic: string) => {
		fireHaptic();
		setTopics((current) =>
			current.includes(topic)
				? current.filter((item) => item !== topic)
				: [...current, topic].slice(0, 8),
		);
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
		submitNote("draft");
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
		submitNote("publish");
	};

	const cycleVisibility = () => {
		fireHaptic();
		setVisibility((value) => {
			if (value === "public") return "followers";
			if (value === "followers") return "private";
			return "public";
		});
	};

	const toggleFileComponent = () => {
		fireHaptic();
		setComponents((current) =>
			current.length > 0
				? []
				: [
						{
							type: "file",
							title: "可添加文件",
							value: "发布页组件占位",
						},
					],
		);
	};

	const toggleAllowComment = () => {
		fireHaptic();
		setAdvancedOptions((current) => ({
			...current,
			allowComment: !current.allowComment,
		}));
	};

	return {
		advancedLabel,
		addImage,
		componentLabel,
		content,
		cycleVisibility,
		draftQuery,
		goBack,
		imageUrls,
		isEditingDraft,
		isSubmitting,
		locationName,
		pendingSubmitMode,
		publish,
		removeImage,
		saveDraft,
		setContent,
		setLocationName,
		setTitle,
		title,
		toggleAllowComment,
		toggleFileComponent,
		toggleTopic,
		topics,
		visibilityLabel,
	};
}
