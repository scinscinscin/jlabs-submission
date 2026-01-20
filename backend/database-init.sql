CREATE TABLE "jlabs-users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "jlabs-users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar(255) NOT NULL,
	"hashedPassword" varchar(255) NOT NULL,
	"salt" varchar(255) NOT NULL,
	CONSTRAINT "jlabs-users_email_unique" UNIQUE("email")
);
