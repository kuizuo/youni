import { Ionicons } from "@expo/vector-icons";
import {
	Button,
	cn,
	Toast,
	type ToastComponentProps,
	type ToastShowConfig,
	type ToastShowOptions,
	type ToastVariant,
	useThemeColor,
	useToast,
} from "heroui-native";
import type { ComponentProps } from "react";
import { useCallback } from "react";
import { View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type AppToastOptions = Omit<ToastShowConfig, "icon"> & {
	iconName?: IconName;
};

const TOAST_ICON_BY_VARIANT: Record<ToastVariant, IconName> = {
	accent: "sparkles",
	danger: "close-circle",
	default: "information-circle",
	success: "checkmark-circle",
	warning: "alert-circle",
};

const TOAST_ICON_BACKGROUND_CLASS_BY_VARIANT: Record<ToastVariant, string> = {
	accent: "bg-accent-soft",
	danger: "bg-danger-soft",
	default: "bg-content2",
	success: "bg-success-soft",
	warning: "bg-warning-soft",
};

const TOAST_ACCENT_CLASS_BY_VARIANT: Record<ToastVariant, string> = {
	accent: "bg-accent",
	danger: "bg-danger",
	default: "bg-muted",
	success: "bg-success",
	warning: "bg-warning",
};

const TOAST_ACTION_LABEL_CLASS_BY_VARIANT: Record<ToastVariant, string> = {
	accent: "text-accent-foreground",
	danger: "text-danger-foreground",
	default: "text-foreground",
	success: "text-success-foreground",
	warning: "text-warning-foreground",
};

function AppToastContent({
	options,
	props,
}: {
	options: AppToastOptions;
	props: ToastComponentProps;
}) {
	const variant = options.variant ?? "default";
	const hasDescription = Boolean(options.description);
	const iconColor = useThemeColor(
		variant === "default" ? "muted" : `${variant}-soft-foreground`,
	);
	const iconName = options.iconName ?? TOAST_ICON_BY_VARIANT[variant];

	const handleActionPress = () => {
		options.onActionPress?.({
			hide: props.hide,
			show: props.show,
		});
	};

	return (
		<Toast
			{...props}
			variant={variant}
			placement={options.placement}
			isSwipeable={options.isSwipeable}
			animation={options.animation}
			className={cn(
				"flex-row gap-3 overflow-hidden border border-border-secondary bg-surface px-4 py-3",
				hasDescription ? "items-start" : "items-center",
			)}
		>
			<View
				className={cn(
					"absolute top-0 bottom-0 left-0 w-1",
					TOAST_ACCENT_CLASS_BY_VARIANT[variant],
				)}
			/>
			<View
				className={cn(
					"size-9 items-center justify-center rounded-full",
					hasDescription && "mt-0.5",
					TOAST_ICON_BACKGROUND_CLASS_BY_VARIANT[variant],
				)}
			>
				<Ionicons name={iconName} size={20} color={iconColor} />
			</View>
			<View
				className={cn(
					"min-w-0 flex-1 gap-0.5",
					!hasDescription && "justify-center",
				)}
			>
				{options.label ? (
					<Toast.Title className="pr-1">{options.label}</Toast.Title>
				) : null}
				{options.description ? (
					<Toast.Description className="pr-1">
						{options.description}
					</Toast.Description>
				) : null}
			</View>
			{options.actionLabel ? (
				<Toast.Action className="self-center" onPress={handleActionPress}>
					<Button.Label
						className={TOAST_ACTION_LABEL_CLASS_BY_VARIANT[variant]}
					>
						{options.actionLabel}
					</Button.Label>
				</Toast.Action>
			) : (
				<Toast.Close className={cn("-mr-2", hasDescription && "-mt-1")} />
			)}
		</Toast>
	);
}

export function useAppToast() {
	const { toast, ...rest } = useToast();

	const show = useCallback(
		(options: AppToastOptions | string | ToastShowOptions) => {
			if (typeof options === "string") {
				return toast.show({
					component: (props) => (
						<AppToastContent options={{ label: options }} props={props} />
					),
				});
			}

			if ("component" in options && options.component) {
				return toast.show(options);
			}

			return toast.show({
				duration: options.duration,
				id: options.id,
				onHide: options.onHide,
				onShow: options.onShow,
				component: (props) => (
					<AppToastContent options={options} props={props} />
				),
			});
		},
		[toast],
	);

	return {
		...rest,
		toast: {
			...toast,
			show,
		},
	};
}
