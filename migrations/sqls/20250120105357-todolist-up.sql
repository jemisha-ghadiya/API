/* Replace with your SQL commands */

-- Table: public.todolist

-- DROP TABLE IF EXISTS public.todolist;

CREATE TABLE IF NOT EXISTS public.todolist
(
    id integer NOT NULL ,
    task character varying(50) COLLATE pg_catalog."default",
    description character varying(150) COLLATE pg_catalog."default",
    duration character varying(60) COLLATE pg_catalog."default",
    username character varying(50) COLLATE pg_catalog."default",
    signup_id integer,
    CONSTRAINT todolist_pkey PRIMARY KEY (id),
    CONSTRAINT todolist_signup_id_fkey FOREIGN KEY (signup_id)
        REFERENCES public.signup (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.todolist
    OWNER to postgres;