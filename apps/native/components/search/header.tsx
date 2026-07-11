import {
	Button,
	PressableFeedback,
	SearchField,
	Text,
	useThemeColor,
} from "heroui-native";
import { View } from "react-native";
import {
	SEARCH_TABS,
	type SearchTabKey,
} from "@/components/search/search-utils";
import { AppSeparator } from "@/components/shared/app-separator";
import { fireHaptic } from "@/lib/utils/fire-haptic";

export function SearchHeader({
	activeTab,
	canSubmitKeyword,
	hasActiveSearch,
	keyword,
	onChangeKeyword,
	onChangeTab,
	onClearSearch,
	onSubmitSearch,
	topInset,
}: {
	activeTab: SearchTabKey;
	canSubmitKeyword: boolean;
	hasActiveSearch: boolean;
	keyword: string;
	onChangeKeyword: (value: string) => void;
	onChangeTab: (tab: SearchTabKey) => void;
	onClearSearch: () => void;
	onSubmitSearch: () => void;
	topInset: number;
}) {
	const mutedColor = useThemeColor("muted");

	return (
		<View
			className="mx-auto w-full max-w-xl bg-background px-3 pb-0"
			style={{ paddingTop: Math.max(topInset, 8) + 6 }}
		>
			<View className="flex-row items-center gap-2 pb-3">
				<SearchField
					value={keyword}
					onChange={onChangeKeyword}
					className="min-w-0 flex-1"
				>
					<SearchField.Group>
						<SearchField.SearchIcon iconProps={{ color: mutedColor }} />
						<SearchField.Input
							autoFocus
							placeholder="搜索图文、用户和话题"
							placeholderTextColor={mutedColor}
							returnKeyType="search"
							className="h-11 rounded-full bg-content2"
							onSubmitEditing={onSubmitSearch}
						/>
						<SearchField.ClearButton
							accessibilityLabel="清空搜索"
							iconProps={{ color: mutedColor }}
							onPress={onClearSearch}
						/>
					</SearchField.Group>
				</SearchField>

				<Button
					size="sm"
					variant={canSubmitKeyword ? "primary" : "ghost"}
					className="h-11 rounded-full px-4"
					feedbackVariant="scale-ripple"
					accessibilityLabel="执行搜索"
					isDisabled={!canSubmitKeyword}
					onPress={onSubmitSearch}
				>
					<Button.Label>搜索</Button.Label>
				</Button>
			</View>

			{hasActiveSearch ? (
				<SearchTabs activeTab={activeTab} onChange={onChangeTab} />
			) : null}
			<AppSeparator className="-mx-3" />
		</View>
	);
}

function SearchTabs({
	activeTab,
	onChange,
}: {
	activeTab: SearchTabKey;
	onChange: (tab: SearchTabKey) => void;
}) {
	return (
		<View className="h-11 flex-row items-end">
			{SEARCH_TABS.map((item) => {
				const active = item.key === activeTab;
				return (
					<PressableFeedback
						key={item.key}
						accessibilityRole="tab"
						accessibilityState={active ? { selected: true } : undefined}
						className="flex-1 items-center justify-end gap-2"
						onPress={() => {
							fireHaptic();
							onChange(item.key);
						}}
					>
						<Text.Paragraph
							weight="semibold"
							className={active ? "text-foreground" : "text-muted"}
						>
							{item.label}
						</Text.Paragraph>
						<View
							className={
								active ? "h-1 w-14 rounded-full bg-accent" : "h-1 w-14"
							}
						/>
					</PressableFeedback>
				);
			})}
		</View>
	);
}
