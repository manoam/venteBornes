import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import VentesListPage from "./pages/VentesListPage";
import VenteDetailPage from "./pages/VenteDetailPage";
import VenteCreatePage from "./pages/VenteCreatePage";
import FacturationsPage from "./pages/FacturationsPage";
import DashboardPage from "./pages/DashboardPage";
import TypesVentesPage from "./pages/TypesVentesPage";
import GammesPage from "./pages/GammesPage";
import ModelesPage from "./pages/ModelesPage";
import ContratsListPage from "./pages/ContratsListPage";
import ContratDetailPage from "./pages/ContratDetailPage";
import ContratCreatePage from "./pages/ContratCreatePage";
import SyncPage from "./pages/SyncPage";
import ImportPage from "./pages/ImportPage";
import CouleursPage from "./pages/CouleursPage";

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
        <Route path="/contrats" element={<ContratsListPage />} />
        <Route path="/contrats/nouveau" element={<ContratCreatePage />} />
        <Route path="/contrats/:id" element={<ContratDetailPage />} />
        <Route path="/parametres/types-ventes" element={<TypesVentesPage />} />
        <Route path="/parametres/gammes" element={<GammesPage />} />
        <Route path="/parametres/modeles" element={<ModelesPage />} />
        <Route path="/parametres/couleurs" element={<CouleursPage />} />
        <Route path="/parametres/import" element={<ImportPage />} />
        <Route path="/parametres/sync" element={<SyncPage />} />
      </Route>
    </Routes>
  );
}
