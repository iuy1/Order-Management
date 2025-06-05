// routes/_app.tsx
import { FreshContext } from '$fresh/server.ts';
import { User } from '../utils/db.ts';

// deno-lint-ignore require-await
export default async function App(_req: Request, ctx: FreshContext) {
  const user = ctx.state.user as User;

  return (
    <html>
      <head>
        <meta charset='UTF-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <title>Food Order System</title>
        <script src='https://cdn.tailwindcss.com'></script>
      </head>
      <body class='bg-gray-100 font-sans'>
        <header class='bg-white shadow-md sticky top-0 z-50'>
          <div class='container mx-auto px-4 py-4 flex items-center justify-between'>
            {/* Logo/Brand */}
            <a href='/' class='text-2xl font-bold text-blue-600'>
              Order-Management
            </a>
            {/* Navigation */}
            <nav class='flex space-x-4 md:space-x-6 items-center'>
              <a
                href='/'
                class='text-gray-600 hover:text-blue-600 font-medium transition-colors'
              >
                Home
              </a>
              <a
                href='/menu'
                class='text-gray-600 hover:text-blue-600 font-medium transition-colors'
              >
                Menu
              </a>
              {user
                ? (
                  <>
                    <a
                      href='/cart'
                      class='text-gray-600 hover:text-blue-600 font-medium transition-colors'
                    >
                      Cart
                    </a>
                    <a
                      href='/orders'
                      class='text-gray-600 hover:text-blue-600 font-medium transition-colors'
                    >
                      Orders
                    </a>
                    <a
                      href='/logout'
                      class='bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors'
                    >
                      Logout
                    </a>
                  </>
                )
                : (
                  <>
                    <a
                      href='/register'
                      class='text-gray-600 hover:text-blue-600 font-medium transition-colors'
                    >
                      Register
                    </a>
                    <a
                      href='/login'
                      class='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors'
                    >
                      Login
                    </a>
                  </>
                )}
            </nav>
          </div>
        </header>
        <main class='container mx-auto px-4 py-8'>
          <ctx.Component />
        </main>
      </body>
    </html>
  );
}
