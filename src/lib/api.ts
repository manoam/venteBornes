import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// ─── Ventes ─────────────────────────────────────────────────

export const ventesApi = {
  list: (params?: Record<string, string>) =>
    api.get("/ventes", { params }).then((r) => r.data),

  get: (id: number) =>
    api.get(`/ventes/${id}`).then((r) => r.data),

  create: (data: Record<string, unknown>) =>
    api.post("/ventes", data).then((r) => r.data),

  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/ventes/${id}`, data).then((r) => r.data),

  updateStatut: (id: number, data: Record<string, unknown>) =>
    api.patch(`/ventes/${id}/statut`, data).then((r) => r.data),

  updateFacturation: (id: number, data: Record<string, unknown>) =>
    api.patch(`/ventes/${id}/facturation`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/ventes/${id}`).then((r) => r.data),
};

// ─── Clients ────────────────────────────────────────────────

export const clientsApi = {
  list: (params?: Record<string, string>) =>
    api.get("/clients", { params }).then((r) => r.data),

  get: (id: number) =>
    api.get(`/clients/${id}`).then((r) => r.data),

  create: (data: Record<string, unknown>) =>
    api.post("/clients", data).then((r) => r.data),

  searchCrm: (q: string) =>
    api.get("/clients/search-crm", { params: { q } }).then((r) => r.data),

  getFromCrm: (crmId: number) =>
    api.get(`/clients/crm/${crmId}`).then((r) => r.data),
};

// ─── Users ──────────────────────────────────────────────────

export const usersApi = {
  list: () => api.get("/users").then((r) => r.data),
};

// ─── Référentiel ────────────────────────────────────────────

export const referenceApi = {
  gammesBornes: () => api.get("/reference/gammes-bornes").then((r) => r.data),
  couleurs: () => api.get("/reference/couleurs").then((r) => r.data),
  accessoires: () => api.get("/reference/accessoires").then((r) => r.data),
  consommables: () => api.get("/reference/consommables").then((r) => r.data),
  parcs: () => api.get("/reference/parcs").then((r) => r.data),
  pays: () => api.get("/reference/pays").then((r) => r.data),
  bornes: () => api.get("/reference/bornes").then((r) => r.data),
  typesVentes: () => api.get("/reference/types-ventes").then((r) => r.data),
};

// ─── Paramètres / Admin ─────────────────────────────────────

export const parametresApi = {
  typesVentes: {
    list: () => api.get("/parametres/types-ventes").then((r) => r.data),
    create: (data: Record<string, unknown>) =>
      api.post("/parametres/types-ventes", data).then((r) => r.data),
    update: (id: number, data: Record<string, unknown>) =>
      api.put(`/parametres/types-ventes/${id}`, data).then((r) => r.data),
    delete: (id: number) =>
      api.delete(`/parametres/types-ventes/${id}`).then((r) => r.data),
  },
};

// ─── Sync ───────────────────────────────────────────────────

export const syncApi = {
  all: () => api.post("/sync/all").then((r) => r.data),
  gammes: () => api.post("/sync/gammes").then((r) => r.data),
  modeles: () => api.post("/sync/modeles").then((r) => r.data),
  users: () => api.post("/sync/users").then((r) => r.data),
};

// ─── Contrats ───────────────────────────────────────────────

export const contratsApi = {
  list: (params?: Record<string, string>) =>
    api.get("/contrats", { params }).then((r) => r.data),

  stats: () => api.get("/contrats/stats").then((r) => r.data),

  get: (id: number) => api.get(`/contrats/${id}`).then((r) => r.data),

  create: (data: Record<string, unknown>) =>
    api.post("/contrats", data).then((r) => r.data),

  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/contrats/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/contrats/${id}`).then((r) => r.data),

  addCommentaire: (contratId: number, data: { contenu: string; auteur?: string }) =>
    api.post(`/contrats/${contratId}/commentaires`, data).then((r) => r.data),

  deleteCommentaire: (contratId: number, id: number) =>
    api.delete(`/contrats/${contratId}/commentaires/${id}`).then((r) => r.data),
};

// ─── Dashboard ──────────────────────────────────────────────

export const dashboardApi = {
  stats: () => api.get("/dashboard/stats").then((r) => r.data),
  facturations: (isArchive = false) =>
    api.get("/dashboard/facturations", { params: { isArchive } }).then((r) => r.data),
};

export default api;
