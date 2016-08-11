-- 1456534389 UP user tables

CREATE TABLE "user" (
    id serial,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    password character varying(400) NULL,
    email character varying(200) NOT NULL,
    created_at timestamptz DEFAULT now(),
    address_id integer NULL,
    deleted_at timestamptz NULL,
    reg_ip varchar(50) NULL,
    updated_at timestamptz NULL,
    login_at timestamptz NULL,
    avatar_url varchar(200),
    CONSTRAINT pk_user PRIMARY KEY (id)
);

ALTER TABLE "user" ADD UNIQUE ("email");

CREATE UNIQUE INDEX email_lowercase ON "user" (lower(email));

CREATE TABLE "session" (
    id serial,
    user_id integer NOT NULL,
    token character varying(400) NOT NULL,
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz DEFAULT now(),
    CONSTRAINT pk_session
        PRIMARY KEY (id),
    CONSTRAINT fk_session_user_id
        FOREIGN KEY (user_id)
        REFERENCES "user" (id)
        ON UPDATE RESTRICT
        ON DELETE CASCADE
);

CREATE INDEX "session.token" ON "session" (token ASC NULLS LAST);

CREATE TABLE "address" (
    id serial,
    user_id integer NOT NULL,
    line1 character varying(500) NOT NULL,
    line2 character varying(500),
    zip character varying(50) NOT NULL,
    city character varying(100) NOT NULL,
    country character varying(50),
    state character varying(50),
    created_at timestamptz DEFAULT now(),
    deleted_at timestamptz,
    updated_at timestamptz,
    CONSTRAINT pk_address PRIMARY KEY (id),
    CONSTRAINT fk_address_user_id
        FOREIGN KEY (user_id)
        REFERENCES "user"(id)
        ON UPDATE RESTRICT
        ON DELETE CASCADE
);

ALTER TABLE "user"
    ADD CONSTRAINT "user_address_fk"
    FOREIGN KEY (address_id)
    REFERENCES address(id)
    ON UPDATE RESTRICT
    ON DELETE SET NULL;

CREATE TABLE "facebook" (
    user_id integer NOT NULL,
    fb_user_id varchar(200) NOT NULL,
    fb_access_token varchar(500) NOT NULL,
    CONSTRAINT facebook_pkey PRIMARY KEY (user_id),
    CONSTRAINT facebook_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES "user"(id) ON DELETE CASCADE
);
