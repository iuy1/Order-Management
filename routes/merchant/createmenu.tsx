import { Handlers } from '$fresh/server.ts';
import { Head } from '$fresh/runtime.ts';
import { createMenu, User } from '../../utils/db.ts';

export const handler: Handlers = {
  async POST(req, ctx) {
    const body = await req.formData();
    const name = body.get('name')?.toString();
    const price = parseFloat(body.get('price')?.toString() || '0');
    const description = body.get('description')?.toString() || null;
    const merchant_id = (ctx.state.user as User).id;

    if (
      !name || isNaN(price) || price < 0
    ) {
      return new Response(
        JSON.stringify({
          error: 'Name, valid price, and valid merchant ID are required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const _menu = await createMenu(name, price, description, merchant_id);
    return new Response(null, {
      status: 302,
      headers: { Location: '/menu' }, // Redirect to menu list or dashboard
    });
  },
};

export default function CreateMenuPage() {
  return (
    <>
      <Head>
        <title>Create Menu Item - Food Order System</title>
      </Head>
      <div class='flex items-center justify-center bg-gray-100 py-6'>
        <div class='bg-white shadow-md rounded-lg p-8 max-w-md w-full'>
          <h2 class='text-2xl font-bold text-blue-600 text-center mb-6'>
            Create New Menu Item
          </h2>
          <form method='POST' class='space-y-6'>
            <div>
              <label
                for='name'
                class='block text-sm font-medium text-gray-700 mb-1'
              >
                Item Name
              </label>
              <input
                type='text'
                name='name'
                id='name'
                placeholder='Enter item name'
                class='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div>
              <label
                for='price'
                class='block text-sm font-medium text-gray-700 mb-1'
              >
                Price
              </label>
              <input
                type='number'
                name='price'
                id='price'
                placeholder='Enter price (e.g., 9.99)'
                step='1'
                min='0'
                class='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div>
              <label
                for='description'
                class='block text-sm font-medium text-gray-700 mb-1'
              >
                Description (Optional)
              </label>
              <textarea
                name='description'
                id='description'
                placeholder='Enter item description'
                class='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                rows={4}
              />
            </div>
            <button
              type='submit'
              class='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors'
            >
              Create Menu Item
            </button>
          </form>
          <p class='mt-4 text-center text-sm text-gray-600'>
            Back to{' '}
            <a href='/menu' class='text-blue-600 hover:underline'>
              Menu
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
