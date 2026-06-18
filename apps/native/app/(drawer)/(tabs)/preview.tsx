import { Ionicons } from "@expo/vector-icons";
import { Button, Card, Surface, Text, useToast } from "heroui-native";
import {
	ProgressBar,
	ProgressButton,
	Stepper,
	TrendChip,
} from "heroui-native-pro";
import { useState } from "react";

import { Container } from "@/components/container";

const steps = [
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
						<TrendChip size="md" trend="up">
							+12.4%
						</TrendChip>
						<TrendChip size="md" trend="neutral">
							0.0%
						</TrendChip>
						<TrendChip size="md" trend="down">
							-3.2%
						</TrendChip>
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
					<Stepper
						currentStep={currentStep}
						onStepChange={setCurrentStep}
						orientation="vertical"
					>
						{steps.map((step) => (
							<Stepper.Step key={step.title}>
								<Stepper.Rail />
								<Stepper.Content>
									<Stepper.Title>{step.title}</Stepper.Title>
									<Stepper.Description>{step.description}</Stepper.Description>
								</Stepper.Content>
							</Stepper.Step>
						))}
					</Stepper>
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
					<ProgressBar value={72} color="accent">
						<Surface
							variant="transparent"
							className="flex-row items-center justify-between p-0"
						>
							<ProgressBar.Label>样式接入进度</ProgressBar.Label>
							<ProgressBar.ValueLabel />
						</Surface>
						<ProgressBar.Track>
							<ProgressBar.Fill />
						</ProgressBar.Track>
					</ProgressBar>
					<ProgressButton
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
						<ProgressButton.Label>长按验证</ProgressButton.Label>
						<ProgressButton.Overlay>
							<ProgressButton.MaskLabel>长按验证</ProgressButton.MaskLabel>
						</ProgressButton.Overlay>
					</ProgressButton>
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
