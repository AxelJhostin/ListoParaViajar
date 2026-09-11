CREATE TABLE "sync_operations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"record_id" uuid NOT NULL,
	"result" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_records" (
	"id" uuid PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"data" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "record_version_positive" CHECK ("trip_records"."version">0),
	CONSTRAINT "record_kind_valid" CHECK ("trip_records"."kind" in ('expense','packing','purchase','document','idea','leg','info'))
);
--> statement-breakpoint
CREATE INDEX "records_kind_idx" ON "trip_records" USING btree ("kind","deleted");