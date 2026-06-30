ALTER TYPE "public"."notification_type" ADD VALUE 'message' BEFORE 'announcement';--> statement-breakpoint
CREATE TABLE "direct_conversation" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"member_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "direct_conversation_participant" (
	"conversation_id" varchar(256) NOT NULL,
	"user_id" text NOT NULL,
	"last_read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "direct_conversation_participant_conversation_id_user_id_pk" PRIMARY KEY("conversation_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "direct_message" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"conversation_id" varchar(256) NOT NULL,
	"sender_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "direct_conversation_participant" ADD CONSTRAINT "direct_conversation_participant_conversation_id_direct_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."direct_conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_conversation_participant" ADD CONSTRAINT "direct_conversation_participant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_message" ADD CONSTRAINT "direct_message_conversation_id_direct_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."direct_conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_message" ADD CONSTRAINT "direct_message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "direct_conversation_member_key_idx" ON "direct_conversation" USING btree ("member_key");--> statement-breakpoint
CREATE INDEX "direct_conversation_updated_idx" ON "direct_conversation" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "direct_conversation_participant_user_idx" ON "direct_conversation_participant" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "direct_message_conversation_created_idx" ON "direct_message" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "direct_message_sender_idx" ON "direct_message" USING btree ("sender_id");