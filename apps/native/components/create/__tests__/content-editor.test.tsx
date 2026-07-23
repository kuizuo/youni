import { describe, expect, jest, test } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { ContentEditor } from "../content-editor";

jest.mock("heroui-native", () => ({
	useThemeColor: () => "#111111",
}));

const editorProps = {
	content: "",
	contentInputRef: { current: null },
	foregroundColor: "#111111",
	isEmojiInputLocked: false,
	mutedColor: "#888888",
	onContentBlur: jest.fn(),
	onContentChange: jest.fn(),
	onContentFocus: jest.fn(),
	onContentSelectionChange: jest.fn(),
	onTitleBlur: jest.fn(),
	onTitleChange: jest.fn(),
	onTitleFocus: jest.fn(),
	onTitleSelectionChange: jest.fn(),
	title: "",
	titleInputRef: { current: null },
};

describe("create editor inputs", () => {
	test("shows the title, body, and validation feedback", async () => {
		await render(
			<ContentEditor
				{...editorProps}
				contentError="请输入正文"
				titleError="请输入标题"
			/>,
		);

		expect(screen.getByPlaceholderText("添加标题")).toBeOnTheScreen();
		expect(screen.getByPlaceholderText("添加正文")).toBeOnTheScreen();
		expect(screen.getAllByRole("alert")).toHaveLength(2);
		expect(screen.getByText("请输入标题")).toBeOnTheScreen();
		expect(screen.getByText("请输入正文")).toBeOnTheScreen();
	});

	test("passes user input to the composer", async () => {
		const onTitleChange = jest.fn();
		const onContentChange = jest.fn();
		await render(
			<ContentEditor
				{...editorProps}
				onContentChange={onContentChange}
				onTitleChange={onTitleChange}
			/>,
		);

		await fireEvent.changeText(
			screen.getByPlaceholderText("添加标题"),
			"周末记录",
		);
		await fireEvent.changeText(
			screen.getByPlaceholderText("添加正文"),
			"今天去了公园",
		);

		expect(onTitleChange).toHaveBeenCalledWith("周末记录");
		expect(onContentChange).toHaveBeenCalledWith("今天去了公园");
	});
});
