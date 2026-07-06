import { TextInput, View } from "react-native";

import { InlineMentionPicker, InlineTopicPicker } from "./create-pickers";
import type { InlineTrigger } from "./create-types";
import {
	LinkedComposerInput,
	type TextSelection,
} from "./linked-composer-input";

export function ContentEditor({
	content,
	foregroundColor,
	inlineTrigger,
	mutedColor,
	selectedTopics,
	title,
	onContentChange,
	onMentionSelect,
	onSelectionChange,
	onTitleChange,
	onTopicSelect,
}: {
	content: string;
	foregroundColor: string;
	inlineTrigger: InlineTrigger | null;
	mutedColor: string;
	selectedTopics: string[];
	title: string;
	onContentChange: (value: string) => void;
	onMentionSelect: (value: string) => void;
	onSelectionChange: (selection: TextSelection) => void;
	onTitleChange: (value: string) => void;
	onTopicSelect: (value: string) => void;
}) {
	return (
		<View className="gap-2">
			<TextInput
				value={title}
				onChangeText={onTitleChange}
				placeholder="添加标题"
				placeholderTextColor={mutedColor}
				maxLength={80}
				returnKeyType="next"
				style={{
					color: foregroundColor,
					fontSize: 24,
					fontWeight: "500",
					lineHeight: 32,
					minHeight: 38,
					padding: 0,
				}}
			/>
			<LinkedComposerInput
				value={content}
				onChangeText={onContentChange}
				onSelectionChange={onSelectionChange}
				placeholder="添加正文"
				placeholderTextColor={mutedColor}
				maxLength={2000}
			/>
			{inlineTrigger?.type === "topic" ? (
				<InlineTopicPicker
					query={inlineTrigger.query}
					selectedTopics={selectedTopics}
					onSelect={onTopicSelect}
				/>
			) : inlineTrigger?.type === "mention" ? (
				<InlineMentionPicker
					query={inlineTrigger.query}
					onSelect={onMentionSelect}
				/>
			) : null}
		</View>
	);
}
