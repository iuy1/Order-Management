import { Handlers } from '$fresh/server.ts';
import { Head } from '$fresh/runtime.ts';
import { login } from '../../utils/session.ts';

export const handler: Handlers = {
  async POST(req, _ctx) {
    const body = await req.formData();
    const username = body.get('username')?.toString();
    const password = body.get('password')?.toString();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Username and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const response = new Response(null, {
      status: 302,
      headers: { Location: '/' },
    });
    const user = await login(response, username, password);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return response;
  },
};

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login - Food Order System</title>
      </Head>
      <div class=' flex items-center justify-center bg-gray-100 py-6'>
        <div class='bg-white shadow-md rounded-lg p-8 max-w-md w-full'>
          <h2 class='text-2xl font-bold text-blue-600 text-center mb-6'>
            Login to Your Account
          </h2>
          <form method='POST' class='space-y-6'>
            <div>
              <label
                for='username'
                class='block text-sm font-medium text-gray-700 mb-1'
              >
                Username
              </label>
              <input
                type='text'
                name='username'
                id='username'
                placeholder='Enter your username'
                class='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div>
              <label
                for='password'
                class='block text-sm font-medium text-gray-700 mb-1'
              >
                Password
              </label>
              <input
                type='password'
                name='password'
                id='password'
                placeholder='Enter your password'
                class='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <button
              type='submit'
              class='w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors'
            >
              Login
            </button>
          </form>
          <p class='mt-4 text-center text-sm text-gray-600'>
            Don't have an account?{' '}
            <a href='/register' class='text-blue-600 hover:underline'>
              Register
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
