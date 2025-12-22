CREATE TABLE "attachmenttable" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1000),
	"goal_id" bigint NOT NULL,
	"user_id" varchar NOT NULL,
	"url" varchar(2048) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habit_table" (
	"id" bigint PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(2000),
	"emoji" varchar(8) DEFAULT '✅',
	"highest_streak" integer DEFAULT 0 NOT NULL,
	"checkInDays" json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "goaltable" DROP CONSTRAINT "goaltable_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "subgoaltable" DROP CONSTRAINT "subgoaltable_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "subgoaltable" DROP CONSTRAINT "subgoaltable_goal_id_goaltable_id_fk";
--> statement-breakpoint
ALTER TABLE "todotable" DROP CONSTRAINT "todotable_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "todotable" DROP CONSTRAINT "todotable_goal_id_goaltable_id_fk";
--> statement-breakpoint
ALTER TABLE "todotable" DROP CONSTRAINT "todotable_subgoal_id_subgoaltable_id_fk";
--> statement-breakpoint
ALTER TABLE "goaltable" ALTER COLUMN "user_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "subgoaltable" ALTER COLUMN "user_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "todotable" ALTER COLUMN "user_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "attachmenttable" ADD CONSTRAINT "attachmenttable_goal_id_goaltable_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goaltable"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachmenttable" ADD CONSTRAINT "attachmenttable_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_table" ADD CONSTRAINT "habit_table_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goaltable" ADD CONSTRAINT "goaltable_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subgoaltable" ADD CONSTRAINT "subgoaltable_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subgoaltable" ADD CONSTRAINT "subgoaltable_goal_id_goaltable_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goaltable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todotable" ADD CONSTRAINT "todotable_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todotable" ADD CONSTRAINT "todotable_goal_id_goaltable_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goaltable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todotable" ADD CONSTRAINT "todotable_subgoal_id_subgoaltable_id_fk" FOREIGN KEY ("subgoal_id") REFERENCES "public"."subgoaltable"("id") ON DELETE cascade ON UPDATE no action;