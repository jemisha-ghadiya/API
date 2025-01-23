/* Replace with your SQL commands */

-- Table: public.signup

-- DROP TABLE IF EXISTS public.signup;

CREATE TABLE IF NOT EXISTS public.signup
(
    id integer NOT NULL,
    username character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT signup_pkey PRIMARY KEY (id),
    CONSTRAINT signup_username_key UNIQUE (username)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.signup
    OWNER to postgres;