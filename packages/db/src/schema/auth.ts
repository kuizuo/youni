import { relations } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { booleanColumn, timestampColumn } from "./_columns";
import { userGenders, userRoles, userStatuses } from "./auth-values";

export {
	type UserGender,
	type UserRole,
	type UserStatus,
	userGenders,
	userRoles,
	userStatuses,
} from "./auth-values";

export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: booleanColumn("email_verified").default(false).notNull(),
	image: text("image"),
	coverImage: text("cover_image"),
	lastLoginMethod: text("last_login_method"),
	handle: text("handle").unique(),
	bio: text("bio"),
	gender: text("gender", { enum: userGenders }).default("unknown").notNull(),
	role: text("role", { enum: userRoles }).default("user").notNull(),
	status: text("status", { enum: userStatuses }).default("active").notNull(),
	isAnonymous: booleanColumn("is_anonymous").default(false).notNull(),
	banned: booleanColumn("banned").default(false).notNull(),
	banReason: text("ban_reason"),
	banExpires: timestampColumn("ban_expires"),
	createdAt: timestampColumn("created_at").defaultNow().notNull(),
	updatedAt: timestampColumn("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export type UserRow = typeof user.$inferSelect;

export const session = sqliteTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestampColumn("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestampColumn("created_at").defaultNow().notNull(),
		updatedAt: timestampColumn("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		impersonatedBy: text("impersonated_by"),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

export type SessionRow = typeof session.$inferSelect;

export const account = sqliteTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestampColumn("access_token_expires_at"),
		refreshTokenExpiresAt: timestampColumn("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestampColumn("created_at").defaultNow().notNull(),
		updatedAt: timestampColumn("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = sqliteTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestampColumn("expires_at").notNull(),
		createdAt: timestampColumn("created_at").defaultNow().notNull(),
		updatedAt: timestampColumn("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));
