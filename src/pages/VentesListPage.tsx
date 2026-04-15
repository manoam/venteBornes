import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Eye } from "lucide-react";
import { ventesApi } from "../lib/api";
import StatusBadge from "../components/StatusBadge";

const STATUTS = [
  { value: "", label: "Tous" },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "EN_PREPA", label: "En préparation" },
  { value: "PRET_EXP", label: "Prête à expédier" },
  { value: "EXPEDIE", label: "Expédiée" },
  { value: "RECEPTIONNE", label: "Réceptionné" },
];

export default function VentesListPage() {
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["ventes", { search, statut, page }],
    queryFn: () =>
      ventesApi.list({
        ...(search && { search }),
        ...(statut && { statut }),
        page: String(page),
      }),
  });

  const ventes = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ventes</h1>
        <Link
          to="/ventes/nouveau"
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Nouvelle vente
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Rechercher par numéro, client..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            value={statut}
            onChange={(e) => {
              setStatut(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
          >
            {STATUTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Numéro
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Client
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Commercial
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Gamme
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Statut
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Chargement...
                </td>
              </tr>
            ) : ventes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Aucune vente trouvée
                </td>
              </tr>
            ) : (
              ventes.map((vente: any) => (
                <tr key={vente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-primary-600">
                    {vente.numero}
                  </td>
                  <td className="px-6 py-4">
                    {vente.client
                      ? `${vente.client.nom} ${vente.client.prenom ?? ""}`
                      : vente.clientNom ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {vente.user?.prenom} {vente.user?.nom}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {vente.gammeBorne?.nom ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge type="statut" value={vente.venteStatut} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(vente.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/ventes/${vente.id}`}
                      className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 text-sm"
                    >
                      <Eye size={16} />
                      Voir
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-600">
              {pagination.total} résultat{pagination.total > 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="px-3 py-1 text-sm">
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
