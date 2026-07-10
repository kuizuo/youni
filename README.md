# Youni

Youni 是一个仿小红书的图文社区项目，实现了内容发现、图文发布、话题搜索、点赞收藏、评论互动、用户关注、私信通知和内容审核等主要核心功能。

项目基于 TypeScript 和 Bun 构建：用户端使用 React Native、Expo Router、HeroUI、TanStack Router，服务端使用 Hono、oRPC 与 Better Auth，数据存储在 Cloudflare D1 与 R2，并通过 Cloudflare 和 Alchemy 完成部署。

项目同时支持 iOS、Android 和浏览器访问，线上资源统一部署在 Cloudflare。

## 项目组成

```text
youni/
├── apps/
│   ├── native/      # 用户端：Expo 应用，同时支持移动端和浏览器
│   ├── web/         # 管理后台
│   └── server/      # 登录、业务接口、图片上传与 AI 接口
├── packages/
│   ├── api/         # 共享业务逻辑与接口定义
│   ├── auth/        # 登录、账号与权限配置
│   ├── db/          # 数据表、迁移和演示数据
│   ├── env/         # 环境变量校验
│   ├── infra/       # Cloudflare 本地运行与部署配置
│   ├── ui/          # 网页端共享样式
│   └── config/      # 共享开发配置
└── package.json     # 项目统一命令入口
```

## 本地运行

### 1. 准备环境

需要提前安装：

- Bun 1.3.10
- Cloudflare 账号
- 可用的 Cloudflare API Token，至少能管理 Workers、D1 和 R2

克隆项目后安装依赖：

```bash
bun install
```

### 2. 配置环境变量

复制环境变量示例：

```bash
cp packages/infra/.env.example packages/infra/.env
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
cp apps/native/.env.example apps/native/.env
```

各文件用途如下：

| 文件 | 主要内容 |
| --- | --- |
| `packages/infra/.env` | Alchemy 加密密码、Cloudflare 账号 ID 和 API Token |
| `apps/server/.env` | 服务地址、登录密钥、管理员邮箱、D1 数据库 ID，以及可选的 Google、邮件和 R2 配置 |
| `apps/web/.env` | 管理后台连接的服务端地址 |
| `apps/native/.env` | 用户端连接的服务端地址，以及可选的 Google 登录配置 |

本地开发常用地址可填写为：

```dotenv
# apps/server/.env
CORS_ORIGIN=http://localhost:3001,http://localhost:8081
BETTER_AUTH_URL=http://localhost:3000

# apps/web/.env
VITE_SERVER_URL=http://localhost:3000

# apps/native/.env
EXPO_PUBLIC_SERVER_URL=http://localhost:3000
```

使用下面的命令生成 `ALCHEMY_PASSWORD` 和 `BETTER_AUTH_SECRET`：

```bash
openssl rand -base64 32
```

补充说明：

- `ADMIN_EMAILS` 用逗号分隔后台管理员邮箱。
- Google 登录和 AI 能力需要填写对应的 Google 配置；不使用时可以留空。
- `RESEND_API_KEY` 留空时，本地重置密码验证码会输出到服务端日志。
- 真机调试时，`localhost` 指向手机自身，需要把用户端的服务地址改成电脑在局域网中的地址。
- 不要提交任何 `.env` 文件或密钥。

### 3. 准备数据库

项目使用 Cloudflare D1。先在 `apps/server/.env` 中填入 `CLOUDFLARE_D1_DATABASE_ID`，然后执行：

```bash
bun run db:migrate
bun run db:seed
```

`db:seed` 会写入本地体验所需的演示数据，可按需跳过。

### 4. 启动项目

同时启动用户端、管理后台和服务端：

```bash
bun run dev
```

默认访问地址：

- 用户端开发服务：`http://localhost:8081`
- 管理后台：`http://localhost:3001`
- 服务端：`http://localhost:3000`

也可以按需单独启动：

```bash
bun run dev:native  # 只启动用户端
bun run dev:web     # 只启动管理后台
bun run dev:server  # 启动 Cloudflare 本地环境、后台和服务端
```

启动用户端后，可以用 Expo Go 扫码，或按终端提示在 iOS、Android 或浏览器中打开。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `bun run dev` | 启动完整开发环境 |
| `bun run dev:native` | 只启动用户端 |
| `bun run dev:web` | 只启动管理后台 |
| `bun run dev:server` | 启动 Cloudflare 本地环境、后台和服务端 |
| `bun run build` | 构建所有应用和共享包 |
| `bun run check-types` | 检查类型问题 |
| `bun run check` | 格式化并检查项目文件 |
| `bun run db:generate` | 根据数据表变更生成迁移文件 |
| `bun run db:migrate` | 执行数据库迁移 |
| `bun run db:push` | 将当前数据表结构直接同步到 D1 |
| `bun run db:seed` | 写入演示数据 |
| `bun run db:studio` | 打开数据库管理界面 |
| `bun run deploy` | 部署到 Cloudflare |
| `bun run destroy` | 删除由本项目创建的 Cloudflare 资源 |

## 数据库变更

修改 `packages/db/src/schema` 下的数据表后，生成并检查迁移文件：

```bash
bun run db:generate
```

确认迁移内容无误后执行：

```bash
bun run db:migrate
```

生产环境优先使用迁移记录维护数据结构，不建议直接使用 `db:push`。

## 部署

部署前确认四个 `.env` 文件已经填写完成，然后执行：

```bash
bun run deploy
```

部署会创建或更新以下资源：

- 用户端静态站点
- 管理后台静态站点
- 服务端 Worker
- D1 数据库
- R2 图片存储桶

当前正式环境域名在 `packages/infra/alchemy.run.ts` 中配置。如需使用自己的域名，请先修改该文件中的用户端、管理后台和服务端域名。

> `bun run destroy` 会删除项目管理的云端资源，仅在确定不再需要这些资源时使用。

## 开发约定

- 统一使用 Bun，不要混用 npm、yarn 或 pnpm。
- 用户端页面放在 `apps/native/app`，可复用界面放在 `apps/native/components`。
- 管理后台页面放在 `apps/web/src/routes`。
- 业务接口放在 `packages/api/src/routers`，登录配置统一放在 `packages/auth`。
- 数据表先修改 `packages/db/src/schema`，再生成迁移文件。
- 提交代码前至少运行 `bun run check-types` 和 `bun run check`。
