import { Description, Label, Radio, RadioGroup, Surface } from "heroui-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Uniwind } from "uniwind";

import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { AppSeparator } from "@/components/shared/app-separator";
import {
	type AppearancePreference,
	getAppearancePreference,
	parseAppearancePreference,
	setAppearancePreference,
} from "@/lib/appearance-preference";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";

const OPTIONS: Array<{
	description: string;
	label: string;
	value: AppearancePreference;
}> = [
	{
		value: "system",
		label: "跟随系统",
		description: "根据手机的外观设置自动切换",
	},
	{ value: "light", label: "浅色", description: "始终使用浅色外观" },
	{ value: "dark", label: "深色", description: "始终使用深色外观" },
];

export default function AppearanceSettingsScreen() {
	const insets = useSafeAreaInsets();
	const { toast } = useAppToast();
	const [preference, setPreference] = useState<AppearancePreference>("system");

	useEffect(() => {
		getAppearancePreference()
			.then(setPreference)
			.catch((): void => {});
	}, []);

	const selectPreference = async (value: string) => {
		const nextPreference = parseAppearancePreference(value);
		const previousPreference = preference;
		if (nextPreference === previousPreference) return;

		fireHaptic();
		setPreference(nextPreference);
		Uniwind.setTheme(nextPreference);
		try {
			await setAppearancePreference(nextPreference);
		} catch {
			setPreference(previousPreference);
			Uniwind.setTheme(previousPreference);
			toast.show({ variant: "danger", label: "外观设置保存失败" });
		}
	};

	return (
		<View className="flex-1 bg-background">
			<ProfilePageHeader title="外观" />
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="px-4 pt-4"
				contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
			>
				<Surface
					variant="secondary"
					className="overflow-hidden rounded-2xl p-0"
				>
					<RadioGroup value={preference} onValueChange={selectPreference}>
						{OPTIONS.map((option, index) => (
							<View key={option.value}>
								{index > 0 ? <AppSeparator className="opacity-60" /> : null}
								<Pressable
									accessibilityLabel={option.label}
									accessibilityHint={option.description}
									accessibilityRole="radio"
									accessibilityState={{
										checked: preference === option.value,
									}}
									onPress={() => selectPreference(option.value)}
								>
									<RadioGroup.Item
										value={option.value}
										className="px-4 py-3.5"
										pointerEvents="none"
									>
										<View className="min-w-0 flex-1 gap-0.5">
											<Label>{option.label}</Label>
											<Description>{option.description}</Description>
										</View>
										<Radio />
									</RadioGroup.Item>
								</Pressable>
							</View>
						))}
					</RadioGroup>
				</Surface>
			</ScrollView>
		</View>
	);
}
