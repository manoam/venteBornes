import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import VentesListPage from "./pages/VentesListPage";
import VenteDetailPage from "./pages/VenteDetailPage";
import VenteCreatePage from "./pages/VenteCreatePage";
import FacturationsPage from "./pages/FacturationsPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/ventes" replace />} />
        <Route path="/ventes" element={<VentesListPage />} />
        <Route path="/ventes/nouveau" element={<VenteCreatePage />} />
        <Route path="/ventes/:id" element={<VenteDetailPage />} />
        <Route path="/facturations" element={<FacturationsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}
