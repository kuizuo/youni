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
		return <ErrorState onRetry={onRetry} />;
	}

	if (isFollowingGuest) {
		return (
			<EmptyState
				icon="person-add-outline"
				title="登录后查看关注"
				description="关注喜欢的博主，及时看到他们的新图文。"
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
			title={
				activeTab === "following" ? "关注的人还没更新" : "分享第一篇图文吧"
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
