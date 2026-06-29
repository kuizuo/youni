CREATE TABLE "note_view_history" (
	"note_id" varchar(256) NOT NULL,
	"user_id" text NOT NULL,
	"viewed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "note_view_history_user_id_note_id_pk" PRIMARY KEY("user_id","note_id")
);
--> statement-breakpoint
ALTER TABLE "note_view_history" ADD CONSTRAINT "note_view_history_note_id_note_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."note"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_view_history" ADD CONSTRAINT "note_view_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "note_view_history_user_viewed_idx" ON "note_view_history" USING btree ("user_id","viewed_at");--> statement-breakpoint
CREATE INDEX "note_view_history_note_idx" ON "note_view_history" USING btree ("note_id");