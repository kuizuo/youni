import Constants from "expo-constants";
import { ListGroup, Typography } from "heroui-native";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { YouniMark } from "@/components/brand/youni-logo";
import { ProfilePageHeader } from "@/components/profile/profile-page-header";

export default function AboutSettingsScreen() {
	const insets = useSafeAreaInsets();
	const version = Constants.expoConfig?.version ?? "未知";

	return (
		<View className="flex-1 bg-background">
			<ProfilePageHeader title="关于 Youni" />
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="flex-grow justify-center gap-8 px-4 pt-4"
				contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
			>
				<View className="items-center gap-3">
					<YouniMark size={88} />
					<View className="items-center gap-1">
						<Typography.Heading className="text-2xl">Youni</Typography.Heading>
						<Typography.Paragraph color="muted" type="body-sm">
							发现、记录与分享
						</Typography.Paragraph>
					</View>
				</View>

				<ListGroup variant="secondary" className="overflow-hidden rounded-2xl">
					<ListGroup.Item disabled className="px-4 py-3.5">
						<ListGroup.ItemContent>
							<ListGroup.ItemTitle>版本</ListGroup.ItemTitle>
						</ListGroup.ItemContent>
						<ListGroup.ItemSuffix>
							<Typography.Paragraph selectable color="muted" type="body-sm">
								{version}
							</Typography.Paragraph>
						</ListGroup.ItemSuffix>
					</ListGroup.Item>
				</ListGroup>
			</ScrollView>
		</View>
	);
}
