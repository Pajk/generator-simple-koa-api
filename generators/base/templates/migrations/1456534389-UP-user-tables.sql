-- 1456534389 UP user tables

CREATE TABLE "user" (
    id serial,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    password character varying(400) NOT NULL,
    email character varying(200) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pk_user PRIMARY KEY (id)
);

ALTER TABLE "user" ADD UNIQUE ("email");

CREATE UNIQUE INDEX email_lowercase ON "user" (lower(email));

CREATE TABLE "session" (
    id serial,
    user_id integer NOT NULL,
    token character varying(400) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pk_session PRIMARY KEY (id),
    CONSTRAINT fk_session_user_id FOREIGN KEY (user_id) REFERENCES "user" (id) ON UPDATE RESTRICT ON DELETE CASCADE
);

CREATE INDEX "session.token" ON "session" (token ASC NULLS LAST);

CREATE TABLE address (
    id serial,
    user_id integer NOT NULL,
    line1 character varying(500) NOT NULL,
    line2 character varying(500),
    zip character varying(50) NOT NULL,
    city character varying(100) NOT NULL,
    country character varying(50),
    state character varying(50),
    created_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT pk_address PRIMARY KEY (id),
    CONSTRAINT fk_address_user_id FOREIGN KEY (user_id) REFERENCES "user"(id) ON UPDATE RESTRICT ON DELETE CASCADE
);

ALTER TABLE "user"
ADD COLUMN "address_id" integer NULL,
ADD COLUMN "deleted_at" timestamp with time zone NULL,
ADD COLUMN "reg_ip" varchar(50) NULL,
ADD COLUMN "updated_at" timestamp with time zone NULL,
ADD COLUMN "login_at" timestamp with time zone NULL,
ADD COLUMN "avatar_url" varchar(200),
ADD CONSTRAINT "user_address_fk" FOREIGN KEY (address_id) REFERENCES address(id) ON UPDATE RESTRICT ON DELETE SET NULL;

CREATE TABLE facebook (
    user_id integer NOT NULL,
    fb_user_id varchar(200) NOT NULL,
    fb_access_token varchar(500) NOT NULL
);

ALTER TABLE ONLY facebook
    ADD CONSTRAINT facebook_pkey
    PRIMARY KEY (user_id);

ALTER TABLE ONLY facebook
    ADD CONSTRAINT facebook_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES "user"(id) ON DELETE CASCADE;

ALTER TABLE "user" ALTER COLUMN password DROP NOT NULL;