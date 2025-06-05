import { FreshContext } from '$fresh/server.ts';
import { User } from '../../utils/db.ts';

export async function handler(_req: Request, ctx: FreshContext) {
  const user = ctx.state.user as User | null;
  // Redirect to index if already authenticated
  if (user?.role === 'merchant') {
    return await ctx.next();
  }
  return new Response(null, {
    status: 302,
    headers: { Location: '/' },
  });
}
