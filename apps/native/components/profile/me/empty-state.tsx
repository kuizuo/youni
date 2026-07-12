import { EmptyState } from "@/components/social-states";

import type { ProfileTabKey } from "../profile-tabs";

export function MeTabEmptyState({
	tab,
	onCreate,
}: {
	tab: ProfileTabKey;
	onCreate: () => void;
}) {
	if (tab === "collections") {
		return (
			<EmptyState
				icon="bookmark-outline"
				title="收藏的图文会出现在这里，去逛逛吧"
			/>
		);
	}
	if (tab === "liked") {
		return <EmptyState title="赞过的图文会出现在这里，去逛逛吧" />;
	}
	if (tab === "comments") {
		return (
			<EmptyState
				icon="chatbubble-ellipses-outline"
				title="评论过的图文会出现在这里，去看看吧"
			/>
		);
	}
	return (
		<EmptyState
			icon="add-circle-outline"
			title="分享第一篇图文吧"
			actionLabel="去发布"
			onAction={onCreate}
		/>
	);
}
