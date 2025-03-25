CREATE TABLE "cars" (
	"id" serial PRIMARY KEY NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"year" integer NOT NULL,
	"price" integer NOT NULL,
	"mileage" integer NOT NULL,
	"car_id" text NOT NULL,
	"fuel_type" text NOT NULL,
	"transmission" text NOT NULL,
	"drivetrain" text NOT NULL,
	"displacement" integer,
	"seat_count" integer,
	"type" text,
	"exterior_color" text NOT NULL,
	"interior_color" text NOT NULL,
	"vin" text,
	"engine_details" text,
	"mpg" text,
	"description" text,
	"seller_name" text NOT NULL,
	"seller_phone" text NOT NULL,
	"seller_email" text,
	"seller_since" text,
	"seller_location" text,
	"images" json NOT NULL,
	"features" json,
	"is_featured" boolean DEFAULT false,
	"original_price_krw" integer,
	"view_count" integer,
	"subscriber_count" integer,
	"warranty" json,
	"dealer" json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"car_id" integer NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"subject" text,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"is_admin" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"share_id" text NOT NULL,
	"name" text NOT NULL,
	"cars" text[],
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "wishlists_share_id_unique" UNIQUE("share_id")
);
