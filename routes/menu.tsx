import { Handlers, PageProps } from '$fresh/server.ts';
import { Head } from '$fresh/runtime.ts';
import { getMenus, MenuInfo } from '../utils/db.ts';

export const handler: Handlers<MenuInfo[]> = {
  async GET(_req, ctx) {
    const menus = await getMenus();
    return ctx.render(menus);
  },
};

export default function MenuPage({ data }: PageProps<MenuInfo[]>) {
  return (
    <>
      <Head>
        <title>Menu - Food Order System</title>
      </Head>
      <div class='bg-gray-100 py-6'>
        <div class='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div class='flex justify-between items-center mb-6'>
            <h2 class='text-2xl font-bold text-blue-600'>Menu Items</h2>
          </div>
          {data.length === 0
            ? <p class='text-center text-gray-600'>No menu items available.</p>
            : (
              <div class='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {data.map((menu) => (
                  <div
                    key={menu.id}
                    class='bg-white shadow-md rounded-lg p-6'
                  >
                    <h3 class='text-lg font-semibold text-gray-800'>
                      {menu.name}
                    </h3>
                    <p class='text-gray-600 mt-1'>${menu.price}</p>
                    {menu.description && (
                      <p class='text-gray-500 mt-2'>{menu.description}</p>
                    )}
                    <p class='text-sm text-gray-400 mt-2'>
                      Merchant: {menu.merchant}
                    </p>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </>
  );
}
