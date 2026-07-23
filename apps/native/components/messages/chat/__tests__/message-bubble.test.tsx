import { expect, jest, test } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { MessageBubble } from "../message-bubble";

jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock("@/lib/utils/fire-haptic", () => ({ fireHaptic: () => {} }));
jest.mock("heroui-native", () => {
	const React = jest.requireActual<typeof import("react")>("react");
	const { Pressable, Text, View } =
		jest.requireActual<typeof import("react-native")>("react-native");
	const wrap = (Component) =>
		function MockWrapper({ children }) {
			return React.createElement(Component, null, children);
		};
	const Menu = Object.assign(wrap(View), {
		Content: wrap(View),
		Item: ({ children, onPress }) =>
			React.createElement(Pressable, { onPress }, children),
		ItemTitle: wrap(Text),
		Overlay: () => null,
		Portal: wrap(View),
		Trigger: ({ children, onLongPress, onPress }) =>
			React.createElement(Pressable, { onLongPress, onPress }, children),
	});

	return {
		cn: (...values: unknown[]) => values.filter(Boolean).join(" "),
		Menu,
		PressableFeedback: Pressable,
		Typography: {
			Paragraph: wrap(Text),
		},
		useThemeColor: (name: string) => name,
	};
});

test.each([
	"hello",
	"😄",
	"这是一条会在达到最大宽度后正常换行的较长消息",
])("shows %s in the message list", async (content) => {
	await render(
		<MessageBubble
			isMine
			item={{
				content,
				createdAt: new Date("2026-07-22T01:18:00.000Z"),
				id: content,
				senderId: "me",
			}}
			onCopy={() => {}}
			onDelete={() => {}}
		/>,
	);

	expect(screen.getByText(content)).toBeOnTheScreen();
});

test("lets the user retry a failed message", async () => {
	const onRetry = jest.fn();
	await render(
		<MessageBubble
			isMine
			item={{
				content: "重新发送",
				createdAt: new Date("2026-07-22T01:18:00.000Z"),
				deliveryStatus: "failed",
				id: "failed-message",
				senderId: "me",
			}}
			onCopy={() => {}}
			onDelete={() => {}}
			onRetry={onRetry}
		/>,
	);

	await fireEvent.press(
		screen.getByRole("button", { name: "发送失败，重新发送" }),
	);

	expect(onRetry).toHaveBeenCalledTimes(1);
});
