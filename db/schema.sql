--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Homebrew)
-- Dumped by pg_dump version 17.4 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: order_state; Type: TYPE; Schema: public; Owner: iuyi
--

CREATE TYPE public.order_state AS ENUM (
    'pending',
    'completed',
    'cancelled'
);


ALTER TYPE public.order_state OWNER TO iuyi;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: iuyi
--

CREATE TYPE public.user_role AS ENUM (
    'customer',
    'merchant',
    'admin'
);


ALTER TYPE public.user_role OWNER TO iuyi;

--
-- Name: update_order_total_price(); Type: FUNCTION; Schema: public; Owner: iuyi
--

CREATE FUNCTION public.update_order_total_price() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- 更新 orders 表中对应订单的 total_price
    UPDATE orders
    SET total_price = (
        SELECT COALESCE(SUM(m.price * om.quantity), 0)
        FROM order_menu om
        JOIN menu m ON om.menu_id = m.id
        WHERE om.order_id = NEW.order_id
        AND m.is_deleted = false
    )
    WHERE orders.id = NEW.order_id
    AND orders.is_deleted = false;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_order_total_price() OWNER TO iuyi;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: menu; Type: TABLE; Schema: public; Owner: iuyi
--

CREATE TABLE public.menu (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    price numeric(10,2) NOT NULL,
    description text,
    merchant_id integer NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.menu OWNER TO iuyi;

--
-- Name: menu_id_seq; Type: SEQUENCE; Schema: public; Owner: iuyi
--

CREATE SEQUENCE public.menu_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_id_seq OWNER TO iuyi;

--
-- Name: menu_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: iuyi
--

ALTER SEQUENCE public.menu_id_seq OWNED BY public.menu.id;


--
-- Name: order_menu; Type: TABLE; Schema: public; Owner: iuyi
--

CREATE TABLE public.order_menu (
    order_id integer NOT NULL,
    menu_id integer NOT NULL,
    quantity integer NOT NULL,
    CONSTRAINT order_menu_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.order_menu OWNER TO iuyi;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: iuyi
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer,
    status public.order_state DEFAULT 'pending'::public.order_state NOT NULL,
    total_price numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.orders OWNER TO iuyi;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: iuyi
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO iuyi;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: iuyi
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: iuyi
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(60) NOT NULL,
    role public.user_role NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    last_login timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.users OWNER TO iuyi;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: iuyi
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO iuyi;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: iuyi
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: menu id; Type: DEFAULT; Schema: public; Owner: iuyi
--

ALTER TABLE ONLY public.menu ALTER COLUMN id SET DEFAULT nextval('public.menu_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: iuyi
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: iuyi
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: menu; Type: TABLE DATA; Schema: public; Owner: iuyi
--

COPY public.menu (id, name, price, description, merchant_id, is_deleted) FROM stdin;
1	i1	1.00	item1	3	f
\.


--
-- Data for Name: order_menu; Type: TABLE DATA; Schema: public; Owner: iuyi
--

COPY public.order_menu (order_id, menu_id, quantity) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: iuyi
--

COPY public.orders (id, user_id, status, total_price, created_at, is_deleted) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: iuyi
--

COPY public.users (id, username, password, role, created_at, is_deleted, last_login) FROM stdin;
1	a	$2a$10$NTuTwTyngxY1MTBDp9z9S.iX0ZzpV2mcs23PtdNnIpKkELe9Dz.d.	customer	2025-06-04 16:26:34.441163	f	2025-06-04 16:26:34.441163
3	m	$2a$10$SkfBcVybHBveRaQnOZMGd.C3dHFbBiVZhAJ/NuN4sLpGPFKOrnbUO	merchant	2025-06-05 07:51:13.72204	f	2025-06-05 07:51:13.72204
\.


--
-- Name: menu_id_seq; Type: SEQUENCE SET; Schema: public; Owner: iuyi
--

SELECT pg_catalog.setval('public.menu_id_seq', 1, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: iuyi
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: iuyi
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: menu menu_pkey; Type: CONSTRAINT; Schema: public; Owner: iuyi
--

ALTER TABLE ONLY public.menu
    ADD CONSTRAINT menu_pkey PRIMARY KEY (id);


--
-- Name: order_menu order_menu_pkey; Type: CONSTRAINT; Schema: public; Owner: iuyi
--

ALTER TABLE ONLY public.order_menu
    ADD CONSTRAINT order_menu_pkey PRIMARY KEY (order_id, menu_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: iuyi
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: iuyi
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: iuyi
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: iuyi
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- Name: order_menu trigger_update_order_total_price; Type: TRIGGER; Schema: public; Owner: iuyi
--

CREATE TRIGGER trigger_update_order_total_price AFTER INSERT OR UPDATE ON public.order_menu FOR EACH ROW EXECUTE FUNCTION public.update_order_total_price();


--
-- Name: menu menu_merchant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: iuyi
--

ALTER TABLE ONLY public.menu
    ADD CONSTRAINT menu_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.users(id);


--
-- Name: order_menu order_menu_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: iuyi
--

ALTER TABLE ONLY public.order_menu
    ADD CONSTRAINT order_menu_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menu(id);


--
-- Name: order_menu order_menu_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: iuyi
--

ALTER TABLE ONLY public.order_menu
    ADD CONSTRAINT order_menu_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: iuyi
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

