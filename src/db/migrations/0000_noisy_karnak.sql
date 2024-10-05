DO $$ BEGIN
 CREATE TYPE "public"."status" AS ENUM('open', 'void', 'collectible', 'paid');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"createTs" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"userId" text NOT NULL,
	"organizationId" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"CreatedAt" timestamp DEFAULT now() NOT NULL,
	"Amount" integer NOT NULL,
	"Description" text NOT NULL,
	"OrganizationId" text,
	"status" "status" NOT NULL,
	"CustomerId" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_CustomerId_customers_id_fk" FOREIGN KEY ("CustomerId") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
