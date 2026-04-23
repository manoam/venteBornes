import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import keycloak from "./lib/keycloak";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

keycloak
  .init({
    onLoad: "login-required",
    checkLoginIframe: false,
  })
  .then((authenticated) => {
    if (!authenticated) {
      keycloak.login();
      return;
    }

    // Refresh token avant expiration
    setInterval(() => {
      keycloak.updateToken(60).catch(() => keycloak.login());
    }, 30000);

    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </React.StrictMode>
    );
  })
  .catch((err) => {
    console.error("Keycloak init failed:", err);
    document.getElementById("root")!.innerHTML =
      '<div style="padding:40px;text-align:center;color:#666">Erreur d\'authentification. <a href="/" style="color:#3b82f6">Réessayer</a></div>';
  });
