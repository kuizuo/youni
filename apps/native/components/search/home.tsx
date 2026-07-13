import { Ionicons } from "@expo/vector-icons";
import { Button, Typography, useThemeColor } from "heroui-native";
import { ScrollView, View } from "react-native";

import { AppSeparator } from "@/components/shared/app-separator";

export function SearchHome({
	contentBottomPadding,
	isEditingHistory,
	onClearHistory,
	onDeleteHistoryWord,
	onFinishEditingHistory,
	onPressHistoryWord,
	onPressRecommendedWord,
	onStartEditingHistory,
	quickWords,
	recentWords,
}: {
	contentBottomPadding: number;
	isEditingHistory: boolean;
	onClearHistory: () => void;
	onDeleteHistoryWord: (word: string) => void;
	onFinishEditingHistory: () => void;
	onPressHistoryWord: (word: string) => void;
	onPressRecommendedWord: (word: string) => void;
	onStartEditingHistory: () => void;
	quickWords: readonly string[];
	recentWords: readonly string[];
}) {
	const mutedColor = useThemeColor("muted");

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="mx-auto w-full max-w-xl gap-7 px-4 pt-5"
			contentContainerStyle={{ paddingBottom: contentBottomPadding }}
			keyboardShouldPersistTaps="handled"
		>
			{recentWords.length > 0 ? (
				<View className="gap-3">
					<View className="flex-row items-center justify-between">
						<Typography.Paragraph weight="semibold" className="text-foreground">
							历史记录
						</Typography.Paragraph>
						{isEditingHistory ? (
							<View className="flex-row items-center gap-3">
								<Button
									size="sm"
									variant="ghost"
									className="h-9 rounded-full px-2"
									feedbackVariant="scale-ripple"
									accessibilityLabel="全部删除搜索历史"
									onPress={onClearHistory}
								>
									<Button.Label className="text-muted">全部删除</Button.Label>
								</Button>
								<AppSeparator orientation="vertical" className="h-4" />
								<Button
									size="sm"
									variant="ghost"
									className="h-9 rounded-full px-2"
									feedbackVariant="scale-ripple"
									accessibilityLabel="完成编辑搜索历史"
									onPress={onFinishEditingHistory}
								>
									<Button.Label className="text-muted">完成</Button.Label>
								</Button>
							</View>
						) : (
							<Button
								isIconOnly
								size="sm"
								variant="ghost"
								className="h-9 w-9 rounded-full"
								accessibilityLabel="编辑搜索历史"
								onPress={onStartEditingHistory}
							>
								<Ionicons name="trash-outline" size={17} color={mutedColor} />
							</Button>
						)}
					</View>
					<WordWrap
						isEditing={isEditingHistory}
						words={recentWords}
						onDeleteWord={onDeleteHistoryWord}
						onPressWord={onPressHistoryWord}
					/>
				</View>
			) : null}

			{quickWords.length > 0 ? (
				<View className="gap-3">
					<Typography.Paragraph weight="semibold" className="text-foreground">
						推荐搜索
					</Typography.Paragraph>
					<WordWrap words={quickWords} onPressWord={onPressRecommendedWord} />
				</View>
			) : null}
		</ScrollView>
	);
}

function WordWrap({
	isEditing = false,
	onDeleteWord,
	onPressWord,
	words,
}: {
	isEditing?: boolean;
	onDeleteWord?: (word: string) => void;
	onPressWord: (word: string) => void;
	words: readonly string[];
}) {
	const mutedColor = useThemeColor("muted");

	return (
		<View className="flex-row flex-wrap gap-2">
			{words.map((item) =>
				isEditing ? (
					<View
						key={item}
						className="h-10 flex-row items-center rounded-full border border-border bg-transparent pr-1 pl-4"
					>
						<Typography.Paragraph numberOfLines={1} className="text-foreground">
							{item}
						</Typography.Paragraph>
						<Button
							isIconOnly
							size="sm"
							variant="ghost"
							className="h-8 w-8 rounded-full"
							feedbackVariant="scale-ripple"
							accessibilityLabel={`删除搜索历史 ${item}`}
							onPress={() => onDeleteWord?.(item)}
						>
							<Ionicons name="close-outline" size={17} color={mutedColor} />
						</Button>
					</View>
				) : (
					<Button
						key={item}
						size="sm"
						variant="outline"
						className="h-10 rounded-full border-border bg-transparent px-4"
						feedbackVariant="scale-ripple"
						onPress={() => onPressWord(item)}
					>
						<Button.Label className="text-foreground">{item}</Button.Label>
					</Button>
				),
			)}
		</View>
	);
}
