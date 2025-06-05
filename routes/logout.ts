// routes/(public)/api/logout.ts
import { Handlers } from '$fresh/server.ts';
import { deleteSession } from '../utils/session.ts';

export const handler: Handlers = {
  async GET(_req, ctx) {
    const session = ctx.state.session as string;
    if (!session) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = new Response(null, {
      status: 302,
      headers: { Location: '/' },
    });
    await deleteSession(session, response);

    return response;
  },
};
