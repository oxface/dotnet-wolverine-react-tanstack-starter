import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useState } from "react";

async function getHealth(): Promise<string> {
  const response = await fetch("/health");

  if (!response.ok) {
    return "offline";
  }

  const body = await response.text();

  try {
    const json = JSON.parse(body) as { status?: string };
    return json.status ?? "unknown";
  } catch {
    return body || "unknown";
  }
}

function HomePage() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    retry: false,
  });

  return (
    <section>
      <p>React, TanStack Query, and TanStack Router are ready.</p>
      <p>Backend health: {health.data ?? health.status}</p>
    </section>
  );
}

function AppShell() {
  return (
    <main className="app-shell">
      <header>
        <Link to="/">Starter Kit</Link>
      </header>
      <Outlet />
    </main>
  );
}

function createAppRouter() {
  const rootRoute = createRootRoute({
    component: AppShell,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: HomePage,
  });

  return createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
  });
}

export function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [router] = useState(createAppRouter);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
