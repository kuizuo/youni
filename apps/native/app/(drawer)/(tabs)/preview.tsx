import { Ionicons } from "@expo/vector-icons";
import { Button, Card, Surface, Text, useToast } from "heroui-native";
import type { ComponentType, ReactNode } from "react";
import { useState } from "react";
import { Platform, View } from "react-native";

import { Container } from "@/components/container";

type LooseComponent = ComponentType<{
	children?: ReactNode;
	[key: string]: unknown;
}>;

type NativeProgressBarComponent = LooseComponent & {
	Fill: LooseComponent;
	Label: LooseComponent;
	Track: LooseComponent;
	ValueLabel: LooseComponent;
};

type NativeProgressButtonComponent = LooseComponent & {
	Label: LooseComponent;
	MaskLabel: LooseComponent;
	Overlay: LooseComponent;
};

type NativeStepperComponent = LooseComponent & {
	Content: LooseComponent;
	Description: LooseComponent;
	Rail: LooseComponent;
	Step: LooseComponent;
	Title: LooseComponent;
};

type NativeProModule = {
	ProgressBar: NativeProgressBarComponent;
	ProgressButton: NativeProgressButtonComponent;
	Stepper: NativeStepperComponent;
	TrendChip: LooseComponent;
};

type PreviewStep = {
	description: string;
	title: string;
};

// Avoid static Pro imports on web: some Pro modules pull Skia chart helpers
// while evaluating, which breaks Expo web before the page renders.
const nativePro: NativeProModule | null =
	Platform.OS === "web"
		? null
		: {
				ProgressBar: (
					require("heroui-native-pro/progress-bar") as {
						ProgressBar: NativeProgressBarComponent;
					}
				).ProgressBar,
				ProgressButton: (
					require("heroui-native-pro/progress-button") as {
						ProgressButton: NativeProgressButtonComponent;
					}
				).ProgressButton,
				Stepper: (
					require("heroui-native-pro/stepper") as {
						Stepper: NativeStepperComponent;
					}
				).Stepper,
				TrendChip: (
					require("heroui-native-pro/trend-chip") as {
						TrendChip: LooseComponent;
					}
				).TrendChip,
			};

const NativeProgressBar = nativePro?.ProgressBar;
const NativeProgressButton = nativePro?.ProgressButton;
const NativeStepper = nativePro?.Stepper;
const NativeTrendChip = nativePro?.TrendChip;

const steps: PreviewStep[] = [
	{ title: "Styles", description: "Global CSS imports and Pro sources" },
	{ title: "Components", description: "Base and Pro components render" },
	{
		title: "Interaction",
		description: "Native press states and animation work",
	},
	{ title: "Ready", description: "Preview page is available in the app" },
];

export default function PreviewScreen() {
	const [currentStep, setCurrentStep] = useState(1);
	const { toast } = useToast();

	return (
		<Container>
			<Surface variant="transparent" className="gap-4 p-4">
				<Card className="gap-4 rounded-3xl p-4">
					<Card.Header className="flex-row items-start justify-between p-0">
						<Card.Body className="gap-1 p-0">
							<Text.Heading type="h2">Native 组件预览</Text.Heading>
							<Text.Paragraph color="muted" type="body-sm">
								确认 HeroUI Native 与 Native Pro 的样式和交互都已经接入。
							</Text.Paragraph>
						</Card.Body>
						<Surface className="size-11 items-center justify-center rounded-full bg-accent p-0">
							<Ionicons name="sparkles" size={20} color="#fff" />
						</Surface>
					</Card.Header>
					<Card.Footer className="flex-row flex-wrap gap-2 p-0">
						{NativeTrendChip ? (
							<>
								<NativeTrendChip size="md" trend="up">
									+12.4%
								</NativeTrendChip>
								<NativeTrendChip size="md" trend="neutral">
									0.0%
								</NativeTrendChip>
								<NativeTrendChip size="md" trend="down">
									-3.2%
								</NativeTrendChip>
							</>
						) : (
							<>
								<WebTrendChip trend="up">+12.4%</WebTrendChip>
								<WebTrendChip trend="neutral">0.0%</WebTrendChip>
								<WebTrendChip trend="down">-3.2%</WebTrendChip>
							</>
						)}
					</Card.Footer>
				</Card>

				<Card className="gap-4 rounded-3xl p-4">
					<Card.Header className="p-0">
						<Card.Body className="gap-1 p-0">
							<Card.Title>Stepper</Card.Title>
							<Card.Description>
								Stepper 来自 Native Pro，用于流程状态展示。
							</Card.Description>
						</Card.Body>
					</Card.Header>
					{NativeStepper ? (
						<NativeStepper
							currentStep={currentStep}
							onStepChange={setCurrentStep}
							orientation="vertical"
						>
							{steps.map((step) => (
								<NativeStepper.Step key={step.title}>
									<NativeStepper.Rail />
									<NativeStepper.Content>
										<NativeStepper.Title>{step.title}</NativeStepper.Title>
										<NativeStepper.Description>
											{step.description}
										</NativeStepper.Description>
									</NativeStepper.Content>
								</NativeStepper.Step>
							))}
						</NativeStepper>
					) : (
						<WebStepper steps={steps} currentStep={currentStep} />
					)}
					<Card.Footer className="flex-row items-center justify-center gap-2 p-0">
						<Button
							size="sm"
							variant="outline"
							isDisabled={currentStep <= 0}
							onPress={() => setCurrentStep((value) => Math.max(0, value - 1))}
						>
							<Button.Label>上一步</Button.Label>
						</Button>
						<Text.Paragraph
							className="w-16 text-center"
							color="muted"
							type="body-xs"
						>
							{currentStep + 1} / {steps.length}
						</Text.Paragraph>
						<Button
							size="sm"
							variant="outline"
							isDisabled={currentStep >= steps.length - 1}
							onPress={() =>
								setCurrentStep((value) => Math.min(steps.length - 1, value + 1))
							}
						>
							<Button.Label>下一步</Button.Label>
						</Button>
					</Card.Footer>
				</Card>

				<Card className="gap-4 rounded-3xl p-4">
					<Card.Header className="p-0">
						<Card.Body className="gap-1 p-0">
							<Card.Title>Progress</Card.Title>
							<Card.Description>
								ProgressBar 和 ProgressButton 来自 Native Pro。
							</Card.Description>
						</Card.Body>
					</Card.Header>
					{NativeProgressBar ? (
						<NativeProgressBar value={72} color="accent">
							<Surface
								variant="transparent"
								className="flex-row items-center justify-between p-0"
							>
								<NativeProgressBar.Label>样式接入进度</NativeProgressBar.Label>
								<NativeProgressBar.ValueLabel />
							</Surface>
							<NativeProgressBar.Track>
								<NativeProgressBar.Fill />
							</NativeProgressBar.Track>
						</NativeProgressBar>
					) : (
						<WebProgressBar value={72} />
					)}
					{NativeProgressButton ? (
						<NativeProgressButton
							autoReset
							holdDuration={900}
							variant="accent"
							onComplete={() =>
								toast.show({
									label: "Native Pro 正常工作",
									duration: 1200,
								})
							}
						>
							<NativeProgressButton.Label>长按验证</NativeProgressButton.Label>
							<NativeProgressButton.Overlay>
								<NativeProgressButton.MaskLabel>
									长按验证
								</NativeProgressButton.MaskLabel>
							</NativeProgressButton.Overlay>
						</NativeProgressButton>
					) : (
						<WebProgressButton
							onPress={() =>
								toast.show({
									label: "Web 预览正常工作",
									duration: 1200,
								})
							}
						/>
					)}
				</Card>

				<Card className="gap-4 rounded-3xl p-4">
					<Card.Header className="p-0">
						<Card.Body className="gap-1 p-0">
							<Card.Title>Base Components</Card.Title>
							<Card.Description>
								Button、Card、Surface、Text 继续使用 HeroUI Native。
							</Card.Description>
						</Card.Body>
					</Card.Header>
					<Card.Footer className="flex-row flex-wrap gap-2 p-0">
						<Button variant="primary" feedbackVariant="scale-ripple">
							<Ionicons name="checkmark-circle" size={16} color="#fff" />
							<Button.Label>主操作</Button.Label>
						</Button>
						<Button variant="secondary" feedbackVariant="scale-ripple">
							<Ionicons name="layers-outline" size={16} color="#8a8a8a" />
							<Button.Label>次操作</Button.Label>
						</Button>
						<Button variant="ghost" feedbackVariant="scale-ripple">
							<Button.Label>轻量操作</Button.Label>
						</Button>
					</Card.Footer>
				</Card>
			</Surface>
		</Container>
	);
}

function WebTrendChip({
	children,
	trend,
}: {
	children: string;
	trend: "down" | "neutral" | "up";
}) {
	const iconName =
		trend === "up" ? "arrow-up" : trend === "down" ? "arrow-down" : "remove";
	const iconColor =
		trend === "up" ? "#16a34a" : trend === "down" ? "#dc2626" : "#ca8a04";

	return (
		<Surface
			variant="secondary"
			className="h-8 flex-row items-center gap-1 rounded-full px-3 py-0"
		>
			<Ionicons name={iconName} size={14} color={iconColor} />
			<Text.Paragraph className="font-semibold text-foreground" type="body-xs">
				{children}
			</Text.Paragraph>
		</Surface>
	);
}

function WebStepper({
	currentStep,
	steps,
}: {
	currentStep: number;
	steps: PreviewStep[];
}) {
	return (
		<View className="gap-3">
			{steps.map((step, index) => {
				const isComplete = index < currentStep;
				const isCurrent = index === currentStep;

				return (
					<View className="flex-row gap-3" key={step.title}>
						<View
							className={[
								"size-7 items-center justify-center rounded-full border",
								isComplete || isCurrent
									? "border-accent bg-accent"
									: "border-border bg-surface-secondary",
							].join(" ")}
						>
							{isComplete ? (
								<Ionicons name="checkmark" size={16} color="#fff" />
							) : (
								<Text.Paragraph
									className={
										isCurrent
											? "font-semibold text-accent-foreground"
											: "font-semibold text-muted"
									}
									type="body-xs"
								>
									{index + 1}
								</Text.Paragraph>
							)}
						</View>
						<View className="flex-1 gap-1">
							<Text.Paragraph className="font-semibold text-foreground">
								{step.title}
							</Text.Paragraph>
							<Text.Paragraph color="muted" type="body-sm">
								{step.description}
							</Text.Paragraph>
						</View>
					</View>
				);
			})}
		</View>
	);
}

function WebProgressBar({ value }: { value: number }) {
	return (
		<View className="gap-2">
			<View className="flex-row items-center justify-between">
				<Text.Paragraph className="font-medium text-foreground" type="body-sm">
					样式接入进度
				</Text.Paragraph>
				<Text.Paragraph color="muted" type="body-sm">
					{value}%
				</Text.Paragraph>
			</View>
			<View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
				<View
					className="h-full rounded-full bg-accent"
					style={{ width: `${value}%` }}
				/>
			</View>
		</View>
	);
}

function WebProgressButton({ onPress }: { onPress: () => void }) {
	return (
		<Button feedbackVariant="scale-ripple" variant="primary" onPress={onPress}>
			<Button.Label>点击验证</Button.Label>
		</Button>
	);
}
