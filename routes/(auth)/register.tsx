import { Handlers } from '$fresh/server.ts';
import { Head } from '$fresh/runtime.ts';
import { register } from '../../utils/session.ts';

export const handler: Handlers = {
  async POST(req, _ctx) {
    const body = await req.formData();
    const username = body.get('username')?.toString();
    const password = body.get('password')?.toString();
    const role = body.get('role')?.toString();

    if (!username || !password || !role) {
      return new Response(
        JSON.stringify({ error: 'Username, password, and role are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (role !== 'customer' && role !== 'merchant') {
      return new Response(
        JSON.stringify({ error: 'Invalid role selected' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const response = new Response(null, {
      status: 302,
      headers: { Location: '/login' }, // Redirect to login after successful registration
    });
    const user = await register(response, username, password, role);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Registration failed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return response;
  },
};

export default function RegisterPage() {
  return (
    <>
      <Head>
        <title>Register - Food Order System</title>
      </Head>
      <div class='flex items-center justify-center bg-gray-100 py-6'>
        <div class='bg-white shadow-md rounded-lg p-8 max-w-md w-full'>
          <h2 class='text-2xl font-bold text-blue-600 text-center mb-6'>
            Create Your Account
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
            <div>
              <label
                for='role'
                class='block text-sm font-medium text-gray-700 mb-1'
              >
                Register as
              </label>
              <select
                name='role'
                id='role'
                class='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='' disabled selected>
                  Select your role
                </option>
                <option value='customer' selected>Customer</option>
                <option value='merchant'>Merchant</option>
              </select>
            </div>
            <button
              type='submit'
              class='w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors'
            >
              Register
            </button>
          </form>
          <p class='mt-4 text-center text-sm text-gray-600'>
            Already have an account?{' '}
            <a href='/login' class='text-blue-600 hover:underline'>
              Login
            </a>
          </p>
        </div>
      </div>
    </>
  );
}