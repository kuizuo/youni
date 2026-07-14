import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { AdminTableEmptyState } from "./admin-table-state";

describe("AdminTableEmptyState", () => {
	test("shows a retry action when loading fails", () => {
		const markup = renderToStaticMarkup(
			<AdminTableEmptyState
				emptyText="暂无数据"
				errorMessage="加载失败"
				isLoading={false}
				onRetry={() => undefined}
			/>,
		);

		expect(markup).toContain("加载失败");
		expect(markup).toContain("重新加载");
		expect(markup).not.toContain("暂无数据");
	});

	test("keeps the loading state ahead of a previous error", () => {
		const markup = renderToStaticMarkup(
			<AdminTableEmptyState
				emptyText="暂无数据"
				errorMessage="加载失败"
				isLoading
			/>,
		);

		expect(markup).toContain("加载中");
		expect(markup).not.toContain("加载失败");
	});
});
