# Youni

Youni 是一个仿小红书的图文社区项目，实现了内容发现、图文发布、话题搜索、点赞收藏、评论互动、用户关注、私信通知和内容审核等主要核心功能。

项目基于 TypeScript 和 Bun 构建：用户端使用 React Native、Expo Router、HeroUI、TanStack Router，服务端使用 Hono、oRPC 与 Better Auth，数据存储在 Cloudflare D1 与 R2，并通过 Cloudflare 和 Alchemy 完成部署。

项目同时支持 iOS、Android 和浏览器访问，线上资源统一部署在 Cloudflare。

## 项目结构

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
| `apps/server/.env` | 服务地址、登录密钥、D1 数据库 ID，以及可选的 Google、邮件和 R2 配置 |
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

`db:seed` 会写入本地体验所需的演示数据。

可使用以下账号登录：

| 类型 | 邮箱 | 密码 |
| --- | --- | --- |
| 管理员 | `admin@youni.app` | `Admin123456` |
| 测试账号1 | `test@youni.app` | `Demo123456` |
| 测试账号2 | `momo@youni.app` | `Demo123456` |

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

## Native 发布流程

先进入目录并登录 Expo：

```bash
cd apps/native
bunx eas-cli@latest login
```

### 首次上架或原生能力变更

```bash
bun run build:eas
bunx eas-cli@latest submit --platform android
bunx eas-cli@latest submit --platform ios
```

### 自动发布

在 GitHub 仓库的 Actions secrets 中添加 `EXPO_TOKEN`，然后执行：

```bash
bun run release
```

新标签推送后，GitHub 会自动发布正式更新，并将 Android APK 和 iOS 模拟器安装包加入对应的 GitHub Release。APK 可直接安装；iOS 包只能在 Mac 的 iOS Simulator 中安装，真机仍需使用 TestFlight 或 App Store。

### 日常更新

页面和普通业务逻辑的修改，先发布测试版，验证后再转为正式版：

```bash
bun run update:preview
bun run update:promote
```

### 直接发布与撤回

跳过测试直接发布：

```bash
bun run update:production
```

出现严重问题时撤回：

```bash
bunx eas-cli@latest update:rollback --channel production
```

## 许可证

[Apache License 2.0](./LICENSE)
