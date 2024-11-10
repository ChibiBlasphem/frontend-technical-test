import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "./config/theme";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import {
  AuthenticationProvider,
  useAuthentication,
} from "./contexts/authentication";
import { UnauthorizedError } from "./api";

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { authState: { isAuthenticated: false } },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof UnauthorizedError) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof UnauthorizedError) {
        localStorage.removeItem("authToken");
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    },
  }),
});

function InnerApp() {
  const { state } = useAuthentication();
  return <RouterProvider router={router} context={{ authState: state }} />;
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <AuthenticationProvider>
            <InnerApp />
          </AuthenticationProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}
