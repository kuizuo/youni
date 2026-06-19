export type TwoColumnFeedItem<T extends { id: string }> =
	| {
			id: string;
			item: T;
			type: "item";
	  }
	| {
			id: string;
			type: "spacer";
	  };

export function createTwoColumnFeed<T extends { id: string }>(
	items: readonly T[],
): TwoColumnFeedItem<T>[] {
	const feedItems: TwoColumnFeedItem<T>[] = items.map((item) => ({
		id: item.id,
		item,
		type: "item",
	}));

	if (feedItems.length % 2 === 1) {
		feedItems.push({
			id: "__two_column_feed_spacer__",
			type: "spacer",
		});
	}

	return feedItems;
}
