import { PressableFeedback, Skeleton, Text } from "heroui-native";
import { View } from "react-native";

import { AppHeading } from "@/components/shared/app-heading";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { formatCount } from "@/utils/format";

import { TopicTopBar } from "./top-bar";
import { TOPIC_SORTS, type TopicSort } from "./types";

export function TopicHeader({
	accentColor,
	discussionCount,
	foregroundColor,
	isLoading,
	noteCount,
	onBack,
	onShare,
	onSortChange,
	sort,
	topInset,
	topicName,
}: {
	accentColor: string;
	discussionCount: number;
	foregroundColor: string;
	isLoading: boolean;
	noteCount: number;
	onBack: () => void;
	onShare: () => void;
	onSortChange: (sort: TopicSort) => void;
	sort: TopicSort;
	topInset: number;
	topicName?: string;
}) {
	return (
		<View className="bg-background" style={{ paddingTop: topInset }}>
			<View className="overflow-hidden">
				<View className="absolute top-10 right-6 size-36 rotate-12 items-center justify-center opacity-5">
					<Text.Heading type="h1" style={{ fontSize: 140, color: accentColor }}>
						#
					</Text.Heading>
				</View>

				<TopicTopBar
					foregroundColor={foregroundColor}
					onBack={onBack}
					onShare={onShare}
				/>

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
									<AppHeading
										type="h2"
										weight="bold"
										numberOfLines={2}
										className="text-foreground"
									>
										# {topicName ?? "话题"}
									</AppHeading>
									<Text.Paragraph type="body-sm" color="muted">
										{formatCount(noteCount)} 篇图文
										{discussionCount > 0
											? `  |  ${formatCount(discussionCount)} 条讨论`
											: ""}
									</Text.Paragraph>
								</>
							)}
						</View>
					</View>
				</View>
			</View>

			<View className="h-16 flex-row items-center justify-between px-4">
				<View className="flex-row items-center gap-8">
					{TOPIC_SORTS.map((item) => {
						const active = item.key === sort;
						return (
							<PressableFeedback
								key={item.key}
								accessibilityRole="tab"
								accessibilityState={active ? { selected: true } : undefined}
								onPress={() => {
									fireHaptic();
									onSortChange(item.key);
								}}
							>
								<AppHeading
									type="h4"
									weight={active ? "bold" : "normal"}
									className={active ? "text-foreground" : "text-muted"}
								>
									{item.label}
								</AppHeading>
							</PressableFeedback>
						);
					})}
				</View>
				<View className="w-12" />
			</View>
		</View>
	);
}
