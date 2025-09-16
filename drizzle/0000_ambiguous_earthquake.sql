CREATE TABLE "goaltable" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(2000),
	"user_id" integer NOT NULL,
	"status" varchar DEFAULT 'Not Started' NOT NULL,
	"category" varchar(100),
	"endDate" timestamp
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" varchar(255) NOT NULL,
	"sender" varchar(255) NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subgoaltable" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(2000),
	"status" varchar DEFAULT 'not_started' NOT NULL,
	"user_id" integer NOT NULL,
	"goal_id" bigint NOT NULL,
	"isdone" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "todotable" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "todotable_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"description" varchar(2000),
	"user_id" integer NOT NULL,
	"is_done" boolean DEFAULT false,
	"category" varchar(100),
	"priority" varchar(100),
	"start_date" timestamp,
	"end_date" timestamp,
	"goal_id" bigint,
	"subgoal_id" bigint
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "goaltable" ADD CONSTRAINT "goaltable_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subgoaltable" ADD CONSTRAINT "subgoaltable_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subgoaltable" ADD CONSTRAINT "subgoaltable_goal_id_goaltable_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goaltable"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todotable" ADD CONSTRAINT "todotable_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todotable" ADD CONSTRAINT "todotable_goal_id_goaltable_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goaltable"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todotable" ADD CONSTRAINT "todotable_subgoal_id_subgoaltable_id_fk" FOREIGN KEY ("subgoal_id") REFERENCES "public"."subgoaltable"("id") ON DELETE no action ON UPDATE no action;