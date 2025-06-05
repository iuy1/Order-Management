import { FreshContext } from '$fresh/server.ts';
import { getCookies } from '@std/http/cookie';
import { getSession, SESSION_COOKIE } from '../utils/session.ts';

export async function handler(req: Request, ctx: FreshContext) {
  try {
    ctx.state.session = getCookies(req.headers)[SESSION_COOKIE] || '';
    ctx.state.user = await getSession(ctx.state.session as string);
    return await ctx.next();
  } catch (err) {
    console.error(err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
