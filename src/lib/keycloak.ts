import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL || "https://plateformdev-auth.orkessi.com",
  realm: import.meta.env.VITE_KEYCLOAK_REALM || "konitys",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "ventes-bornes",
});

export default keycloak;
