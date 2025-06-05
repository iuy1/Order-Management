import { FreshContext } from '$fresh/server.ts';

export async function handler(_req: Request, ctx: FreshContext) {
  const user = ctx.state.user;
  // Redirect to index if already authenticated
  if (user) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/' },
    });
  }
  return await ctx.next();
}
