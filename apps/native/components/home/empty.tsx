import {
	EmptyState,
	ErrorState,
	FeedSkeleton,
} from "@/components/social-states";
import type { useSocialNavigation } from "@/lib/social/use-social-actions";

import type { HomeTab } from "./types";

type SocialNavigation = ReturnType<typeof useSocialNavigation>;

export function HomeEmptyState({
	activeTab,
	isError,
	isFollowingGuest,
	isLoading,
	socialNavigation,
	onDiscover,
	onRetry,
}: {
	activeTab: HomeTab;
	isError: boolean;
	isFollowingGuest: boolean;
	isLoading: boolean;
	socialNavigation: SocialNavigation;
	onDiscover: () => void;
	onRetry: () => void;
}) {
	if (isLoading) return <FeedSkeleton />;

	if (isError) {
		return (
			<ErrorState
				description="内容暂时没有加载出来，请检查网络后重试。"
				onRetry={onRetry}
			/>
		);
	}

	if (isFollowingGuest) {
		return (
			<EmptyState
				icon="person-add-outline"
				title="登录后查看关注"
				description="关注博主后，这里会显示他们的新内容。"
				actionLabel="去登录"
				onAction={() =>
					socialNavigation.goTo({ type: "login", redirectTo: "/" })
				}
			/>
		);
	}

	return (
		<EmptyState
			icon={activeTab === "following" ? "people-outline" : "sparkles-outline"}
			title={activeTab === "following" ? "还没有关注动态" : "还没有内容"}
			description={
				activeTab === "following"
					? "关注几个感兴趣的博主后，这里会显示他们的新内容。"
					: "发布第一篇图文后，这里会出现新的灵感。"
			}
			actionLabel={activeTab === "following" ? "去发现" : "去发布"}
			onAction={() =>
				activeTab === "following"
					? onDiscover()
					: socialNavigation.openPublish()
			}
		/>
	);
}
