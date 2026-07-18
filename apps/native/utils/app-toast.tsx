import {
	Toast,
	type ToastComponentProps,
	type ToastShowConfig,
	type ToastShowOptions,
	useToast,
} from "heroui-native";
import { useCallback } from "react";
import { View } from "react-native";

function ClosableToast({
	options,
	props,
}: {
	options: ToastShowConfig;
	props: ToastComponentProps;
}) {
	return (
		<Toast
			{...props}
			variant={options.variant}
			placement={options.placement}
			isSwipeable={options.isSwipeable}
			animation={options.animation}
			className="flex-row items-center gap-3 rounded-2xl p-3"
		>
			<View className="flex-1">
				{options.label ? <Toast.Title>{options.label}</Toast.Title> : null}
				{options.description ? (
					<Toast.Description>{options.description}</Toast.Description>
				) : null}
			</View>
			{options.actionLabel ? (
				<Toast.Action
					onPress={() =>
						options.onActionPress?.({ hide: props.hide, show: props.show })
					}
				>
					{options.actionLabel}
				</Toast.Action>
			) : null}
			<Toast.Close />
		</Toast>
	);
}

export function useAppToast() {
	const { toast, ...rest } = useToast();
	const show = useCallback(
		(options: string | ToastShowOptions) => {
			if (typeof options !== "string" && options.component) {
				return toast.show(options);
			}

			const config: ToastShowConfig =
				typeof options === "string" ? { label: options } : options;

			return toast.show({
				id: config.id,
				duration: config.duration,
				onShow: config.onShow,
				onHide: config.onHide,
				component: (props) => <ClosableToast options={config} props={props} />,
			});
		},
		[toast],
	);

	return { ...rest, toast: { ...toast, show } };
}
