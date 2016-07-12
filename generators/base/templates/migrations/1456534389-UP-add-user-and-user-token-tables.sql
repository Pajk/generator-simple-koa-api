-- 1456534389 UP add user and user token tables

CREATE TABLE "user" (
    id serial,
    name character varying(100) NOT NULL,
    password character varying(400) NOT NULL,
    email character varying(200) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pk_user PRIMARY KEY (id)
);

ALTER TABLE "user" ADD UNIQUE ("email");

CREATE UNIQUE INDEX email_lowercase ON "user" (lower(email));

CREATE TABLE "user_token" (
    id serial,
    user_id integer NOT NULL,
    token character varying(400) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pk_user_token PRIMARY KEY (id),
    CONSTRAINT fk_user_token_user_id FOREIGN KEY (user_id) REFERENCES "user" (id) ON UPDATE RESTRICT ON DELETE CASCADE
);

CREATE INDEX "user_token.token" ON user_token (token ASC NULLS LAST);
