// db.ts
import { Pool } from '$postgres';
import { compare, hash } from '$bcrypt';

// Enum types based on PostgreSQL schema
export enum OrderState {
  Pending = 'pending',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum UserRole {
  Customer = 'customer',
  Merchant = 'merchant',
  Admin = 'admin',
}

// Interface for users table
export interface User {
  id: number;
  username: string;
  password: string;
  role: UserRole;
  created_at: Date;
  is_deleted: boolean;
  last_login: Date;
}

// Interface for menu table
export interface Menu {
  id: number;
  name: string;
  price: number;
  description: string | null;
  merchant_id: number | null;
  is_deleted: boolean;
}

// Interface for orders table
export interface Order {
  id: number;
  user_id: number | null;
  status: OrderState;
  total_price: number;
  created_at: Date;
  is_deleted: boolean;
}

// Interface for order_menu table
export interface OrderMenu {
  order_id: number;
  menu_id: number;
  quantity: number;
}

// Interface for orders with their menu items
export interface OrderWithMenuItems extends Order {
  menu_items: Array<{
    menu: Menu;
    quantity: number;
  }>;
}

// Database connection configuration
export const pool = new Pool(
  {
    user: Deno.env.get('DB_USER') || 'iuyi',
    hostname: Deno.env.get('DB_HOST') || 'localhost',
    database: Deno.env.get('DB_NAME') || 'food_order_system',
    password: Deno.env.get('DB_PASSWORD') || '',
    port: parseInt(Deno.env.get('DB_PORT') || '5432', 10),
  },
  10, // Maximum number of connections in the pool
  true, // Lazy connection (connects only when needed)
);

// Utility function to handle query execution
async function query<T>(text: string, params: any[]): Promise<T[]> {
  using client = await pool.connect();
  const result = await client.queryObject<T>({ text, args: params });
  return result.rows;
}

// User-related queries
export async function createUser(
  username: string,
  password: string,
  role: UserRole,
): Promise<User> {
  const hashedPassword = await hash(password);
  const text = `
    INSERT INTO public.users (username, password, role)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [username, hashedPassword, role];
  const rows = await query<User>(text, values);
  return rows[0];
}

export async function verifyUserPassword(
  username: string,
  password: string,
): Promise<User | null> {
  const user = await getUserByUsername(username);
  if (!user) { return null; }

  const isValid = await compare(password, user.password);
  return isValid ? user : null;
}

export async function getUserById(id: number): Promise<User | null> {
  const text = `
    SELECT * FROM public.users
    WHERE id = $1 AND is_deleted = false;
  `;
  const rows = await query<User>(text, [id]);
  return rows[0] || null;
}

export async function getUserByUsername(
  username: string,
): Promise<User | null> {
  const text = `
    SELECT * FROM public.users
    WHERE username = $1 AND is_deleted = false;
  `;
  const rows = await query<User>(text, [username]);
  return rows[0] || null;
}

export async function updateUserLastLogin(id: number): Promise<User | null> {
  const text = `
    UPDATE public.users
    SET last_login = CURRENT_TIMESTAMP
    WHERE id = $1 AND is_deleted = false
    RETURNING *;
  `;
  const rows = await query<User>(text, [id]);
  return rows[0] || null;
}

export async function softDeleteUser(id: number): Promise<User | null> {
  const text = `
    UPDATE public.users
    SET is_deleted = true
    WHERE id = $1 AND is_deleted = false
    RETURNING *;
  `;
  const rows = await query<User>(text, [id]);
  return rows[0] || null;
}

// Menu-related queries
export async function createMenu(
  name: string,
  price: number,
  description: string | null,
  merchant_id: number,
): Promise<Menu> {
  const text = `
    INSERT INTO public.menu (name, price, description, merchant_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [name, price, description, merchant_id];
  const rows = await query<Menu>(text, values);
  return rows[0];
}

export interface MenuInfo {
  id: number;
  name: string;
  price: string;
  description: string;
  merchant: number;
}

export async function getMenus(): Promise<MenuInfo[]> {
  const text = `
    SELECT
      M.ID,
      M.NAME,
      M.PRICE,
      M.DESCRIPTION,
      U.USERNAME AS MERCHANT
    FROM
      PUBLIC.MENU M
      JOIN PUBLIC.USERS U ON M.MERCHANT_ID = U.ID
    WHERE
      M.IS_DELETED = FALSE
      AND U.IS_DELETED = FALSE;
  `;
  return await query<MenuInfo>(text, []);
}

export async function getMenuById(id: number): Promise<Menu | null> {
  const text = `
    SELECT * FROM public.menu
    WHERE id = $1 AND is_deleted = false;
  `;
  const rows = await query<Menu>(text, [id]);
  return rows[0] || null;
}

export async function getMenusByMerchant(merchant_id: number): Promise<Menu[]> {
  const text = `
    SELECT * FROM public.menu
    WHERE merchant_id = $1 AND is_deleted = false;
  `;
  return await query<Menu>(text, [merchant_id]);
}

export async function softDeleteMenu(id: number): Promise<Menu | null> {
  const text = `
    UPDATE public.menu
    SET is_deleted = true
    WHERE id = $1 AND is_deleted = false
    RETURNING *;
  `;
  const rows = await query<Menu>(text, [id]);
  return rows[0] || null;
}

// Order-related queries
export async function createOrder(
  user_id: number | null,
  total_price: number,
  status: OrderState = OrderState.Pending,
): Promise<Order> {
  const text = `
    INSERT INTO public.orders (user_id, status, total_price)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [user_id, status, total_price];
  const rows = await query<Order>(text, values);
  return rows[0];
}

export async function getOrderById(
  id: number,
): Promise<OrderWithMenuItems | null> {
  const orderText = `
    SELECT * FROM public.orders
    WHERE id = $1 AND is_deleted = false;
  `;
  const orderRows = await query<Order>(orderText, [id]);
  if (!orderRows[0]) { return null; }

  const menuItemsText = `
    SELECT m.*, om.quantity
    FROM public.order_menu om
    JOIN public.menu m ON om.menu_id = m.id
    WHERE om.order_id = $1 AND m.is_deleted = false;
  `;
  const menuItems = await query<{ menu: Menu; quantity: number }>(
    menuItemsText,
    [id],
  );

  return {
    ...orderRows[0],
    menu_items: menuItems,
  };
}

export async function updateOrderStatus(
  id: number,
  status: OrderState,
): Promise<Order | null> {
  const text = `
    UPDATE public.orders
    SET status = $2
    WHERE id = $1 AND is_deleted = false
    RETURNING *;
  `;
  const rows = await query<Order>(text, [id, status]);
  return rows[0] || null;
}

export async function softDeleteOrder(id: number): Promise<Order | null> {
  const text = `
    UPDATE public.orders
    SET is_deleted = true
    WHERE id = $1 AND is_deleted = false
    RETURNING *;
  `;
  const rows = await query<Order>(text, [id]);
  return rows[0] || null;
}

// OrderMenu-related queries
export async function addMenuToOrder(
  order_id: number,
  menu_id: number,
  quantity: number,
): Promise<OrderMenu> {
  const text = `
    INSERT INTO public.order_menu (order_id, menu_id, quantity)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [order_id, menu_id, quantity];
  const rows = await query<OrderMenu>(text, values);
  return rows[0];
}

export async function getOrderMenus(order_id: number): Promise<OrderMenu[]> {
  const text = `
    SELECT * FROM public.order_menu
    WHERE order_id = $1;
  `;
  return await query<OrderMenu>(text, [order_id]);
}
