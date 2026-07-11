# 发布页图片拖拽排序库调研

## 结论

采用用户指定的 [`react-native-reanimated-dnd@2.0.0`](https://github.com/entropyconquers/react-native-reanimated-dnd/releases/tag/v2.0.0)。它与当前项目的 Expo SDK 55、React Native 0.83、React 19、Reanimated 4和 Gesture Handler 2.30 是直接对齐的，并且官方已提供横向排序、自动滚动、整项拖动和拖动手柄两种模式。

发布页应使用“横向排序 + 整张图片长按拖动”，不渲染 `SortableItem.Handle`，因此不需要任何拖拽图标。排序结果只在 `onDrop` 后一次性写回图片数组，不在拖动过程中频繁改外部状态。

## 与项目的版本匹配

| 项目 | Youni 当前版本 | 库的要求 / 官方测试版本 | 结论 |
| --- | --- | --- | --- |
| Expo | `55.0.26` | 官方 v2.0 声明针对 SDK 55 | 匹配 |
| React Native | `0.83.6` | peer `>=0.80.0`，示例为 `0.83.2` | 匹配 |
| React | `19.2.0` | peer `>=18.0.0`，示例为 `19.2.0` | 匹配 |
| Gesture Handler | `2.30.0` | peer `>=2.28.0`，示例为 `2.30.0` | 匹配 |
| Reanimated | `4.2.1` | peer `>=4.2.0`，示例为 `4.2.1` | 匹配 |
| Worklets | `0.7.4` | peer `>=0.7.0`，示例为 `0.7.2` | 匹配 |

以上范围来自官方 [`package.json`](https://github.com/entropyconquers/react-native-reanimated-dnd/blob/v2.0.0/package.json)；v2.0 发布说明明确列出 Expo SDK 55 / RN 0.83 和新架构支持，官方[SDK 55 示例应用](https://github.com/entropyconquers/react-native-reanimated-dnd/blob/v2.0.0/example-app/package.json)的主要版本也几乎与 Youni 一致。

Youni 的应用根部已经有 `GestureHandlerRootView`，Reanimated 4 和 Worklets 也已安装，因此没有必要再引入一套手势或动画基础设施。

## 适合本页的 API 与交互

### 1. 横向缩略图排序

官方的[Horizontal Sortable 文档](https://github.com/entropyconquers/react-native-reanimated-dnd/blob/v2.0.0/documentation/web-docs/docs/examples/horizontal-sortable.mdx)把媒体缩略图列为直接用途，并要求：

- `direction` 使用 `SortableDirection.Horizontal`。
- 图片使用固定 `itemWidth`；当前 88px 图块符合这一要求。
- 间距由 `gap` 提供，不要再用外层列表另做一次位置计算。
- 边缘自动滚动由库内部处理。

发布页还有一个不参与排序的“添加图片”按钮，因此相比只能渲染数据项的高层 `Sortable`，更适合使用官方 `useHorizontalSortableList` + `SortableItem` 组合，将添加按钮放在排序内容宽度之后。该 Hook 官方返回位置、滚动和每个项目所需属性，见[Hook API](https://github.com/entropyconquers/react-native-reanimated-dnd/blob/v2.0.0/documentation/web-docs/docs/hooks/useHorizontalSortableList.md)。

### 2. 整图长按拖动，不要图标

`SortableItem` 不包含 `SortableItem.Handle` 时，外层整项手势会启用；存在 Handle 时，外层手势会自动禁用，只有 Handle 能拖动。这是官方源码明确的交互分支，见 [`SortableItem`](https://github.com/entropyconquers/react-native-reanimated-dnd/blob/86fb5ab21cc358f733c7b39148fdc7d8b2efeda3/components/SortableItem.tsx#L31) 和 [`useHorizontalSortable`](https://github.com/entropyconquers/react-native-reanimated-dnd/blob/86fb5ab21cc358f733c7b39148fdc7d8b2efeda3/hooks/useHorizontalSortable.ts#L398)。

v2.0.0 实际发布包里的横向排序手势固定为 200ms 长按后启动，源码见 [`activateAfterLongPress(200)`](https://github.com/entropyconquers/react-native-reanimated-dnd/blob/86fb5ab21cc358f733c7b39148fdc7d8b2efeda3/hooks/useHorizontalSortable.ts#L349)。这正好能区分：

- 普通轻点图片：打开图片编辑。
- 轻点右上角删除按钮：删除图片。
- 按住图片约 200ms 后移动：调整顺序。

注意：v2.0 发布说明曾提到可配置 `preDragDelay`，但 v2.0.0 实际 npm 产物的 Sortable 类型与源码并没有公开该属性，而是固定 200ms。本次不应向 `SortableItem` 传入一个并不存在的可配置。

### 3. 只在放下后同步顺序

库内部在拖动时维护位置；`onDrop` 会返回被拖图片的 ID、最终位置和完整位置表，见[源码](https://github.com/entropyconquers/react-native-reanimated-dnd/blob/86fb5ab21cc358f733c7b39148fdc7d8b2efeda3/hooks/useHorizontalSortable.ts#L384)。官方 README 明确提醒不要在 `onMove` 过程中反复更新 React 数组，见[State Management Guidelines](https://github.com/entropyconquers/react-native-reanimated-dnd/blob/v2.0.0/README.md#state-management-guidelines)。

因此本页应该：

1. 使用稳定的图片 `id: string`。
2. 不传 `onMove`。
3. 在 `onDrop` 里根据图片 ID 和目标位置一次性更新图片数组。
4. 用新顺序重新初始化排序位置，避免库内位置与发布表单不一致。

## 网页支持判断

可以尝试支持，但在实际交互验证前不应宣布为“官方保证”。

支持它可用的官方信号：

- 库本身只发布 JavaScript/TypeScript 产物，底层依赖是 Youni 已有的 Reanimated、Gesture Handler 和 Worklets。
- 官方示例项目包含 `react-native-web`、`expo start --web` 和 `expo export --platform web`，见[示例 `package.json`](https://github.com/entropyconquers/react-native-reanimated-dnd/blob/v2.0.0/example-app/package.json)。
- 源码使用 React Native 和上述三个跨平台依赖，没有 iOS/Android 专用分支。

但仍有明确风险：

- v2.0 发布说明的验证项主要是 iOS/Android 和 Expo 检查，没有列出网页端的拖拽自动化测试。
- README 把库定位为“React Native First”，不是 Web 拖放库的移植版；文档没有单独给出 Web 支持承诺。
- Reanimated + Gesture Handler 在浏览器中的手势行为与原生端不完全相同，鼠标、触摸屏和滚动冲突都需要真机验证。

所以交付前必须同时验证 iOS、Android 和 Expo Web 生产导出；Web 不可用时，应仅在 Web 保留简单的点按交互，不应退回到第二套手写拖拽逻辑。

## 与其他候选库的简短比较

| 库 | 优点 | 本项目的不利点 |
| --- | --- | --- |
| `react-native-reanimated-dnd@2.0.0` | 官方就是按 SDK 55 / RN 0.83 / Reanimated 4 发布；横向、长按、自动滚动和全项拖动都是现成能力 | 较新；Web 缺少明确承诺；部分文档与 v2.0 实际类型存在小幅不一致 |
| [`react-native-draggable-flatlist@4.0.3`](https://github.com/computerjazz/react-native-draggable-flatlist/tree/v4.0.3) | 成熟、常用，支持横向 FlatList 和长按 `drag` | 主要是 Reanimated 2 时代的实现，peer 范围虽宽但没有对 Reanimated 4 / SDK 55 的明确发布保证；官方还有[Web 拖放失效](https://github.com/computerjazz/react-native-draggable-flatlist/issues/612)和[横向滚动](https://github.com/computerjazz/react-native-draggable-flatlist/issues/611)的未解决报告 |
| [`react-native-reorderable-list`](https://github.com/omahili/react-native-reorderable-list) | 支持横向、长按、嵌套列表，源码也考虑 Web | 官方示例主要验证 RN 0.76 / Reanimated 3，API 仍标记为 0.x 且可发生破坏性变更；不如指定库与当前技术栈贴合 |

## 实施和验收清单

- 安装并锁定 `react-native-reanimated-dnd@2.0.0`。
- 每张图片使用稳定的字符串 ID，不用数组下标作为 key。
- 不渲染 `SortableItem.Handle`，确认页面没有拖拽图标。
- 轻点图片可编辑；轻点删除按钮只删除；长按图片才启动拖动。
- 分别将第一张拖到最后、最后一张拖到最前，并测试跨越多个位置。
- 用 9 张图测试左右边缘自动滚动。
- 拖动后立即保存草稿，再打开确认顺序已持久化。
- 分别在 iOS 和 Android 真实走完上述流程。
- 执行 Expo Web 生产导出，并在鼠标与触摸屏模式下实际拖动。
