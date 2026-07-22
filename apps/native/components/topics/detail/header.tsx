import type { TopicSort } from "@youni/api/contracts/topics";
import { PressableFeedback, Skeleton, Typography } from "heroui-native";
import { View } from "react-native";

import { fireHaptic } from "@/lib/utils/fire-haptic";
import { formatCount } from "@/utils/format";

import { TOPIC_SORTS } from "./types";

export function TopicHeader({
	accentColor,
	discussionCount,
	isLoading,
	noteCount,
	onMeasuredHeight,
	topInset,
	topicName,
}: {
	accentColor: string;
	discussionCount: number;
	isLoading: boolean;
	noteCount: number;
	onMeasuredHeight: (height: number) => void;
	topInset: number;
	topicName?: string;
}) {
	return (
		<View
			className="overflow-hidden bg-background"
			style={{ paddingTop: topInset }}
			onLayout={(event) =>
				onMeasuredHeight(Math.ceil(event.nativeEvent.layout.height))
			}
		>
			<View className="absolute top-10 right-6 size-36 rotate-12 items-center justify-center opacity-5">
				<Typography.Heading
					type="h1"
					style={{ color: accentColor, fontSize: 140, lineHeight: 168 }}
				>
					#
				</Typography.Heading>
			</View>

			<View className="h-16" />

			<View className="gap-4 px-4 pt-8 pb-8">
				<View className="flex-row items-start justify-between gap-4">
					<View className="min-w-0 flex-1 gap-2">
						{isLoading && !topicName ? (
							<>
								<Skeleton className="h-9 w-44 rounded-full" />
								<Skeleton className="h-5 w-36 rounded-full" />
							</>
						) : (
							<>
								<Typography.Heading
									type="h2"
									weight="bold"
									numberOfLines={2}
									className="text-foreground"
								>
									# {topicName ?? "话题"}
								</Typography.Heading>
								<Typography.Paragraph type="body-sm" color="muted">
									{formatCount(noteCount)} 篇图文
									{discussionCount > 0
										? `  |  ${formatCount(discussionCount)} 条讨论`
										: ""}
								</Typography.Paragraph>
							</>
						)}
					</View>
				</View>
			</View>
		</View>
	);
}

export function TopicSortBar({
	elevated,
	onSortChange,
	sort,
}: {
	elevated: boolean;
	onSortChange: (sort: TopicSort) => void;
	sort: TopicSort;
}) {
	return (
		<View
			className="h-[50px] bg-background"
			style={{
				boxShadow: elevated ? "0 1px 0 rgba(0, 0, 0, 0.07)" : undefined,
			}}
		>
			<View className="relative mx-auto h-full w-full max-w-xl flex-row items-center gap-8 px-4">
				{TOPIC_SORTS.map((item) => {
					const active = item.key === sort;
					return (
						<PressableFeedback
							key={item.key}
							accessibilityRole="tab"
							accessibilityState={active ? { selected: true } : undefined}
							className="h-full w-7 items-center justify-center"
							onPress={() => {
								fireHaptic();
								onSortChange(item.key);
							}}
						>
							<Typography.Paragraph
								weight={active ? "bold" : "normal"}
								className={active ? "text-foreground" : "text-muted"}
								style={{ fontSize: 14, lineHeight: 20 }}
							>
								{item.label}
							</Typography.Paragraph>
						</PressableFeedback>
					);
				})}
			</View>
		</View>
	);
}
