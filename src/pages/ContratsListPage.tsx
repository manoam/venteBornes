import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Eye, Plus } from "lucide-react";
import { contratsApi } from "../lib/api";

const TABS = [
  { key: "", label: "Tous" },
  { key: "LOCATION_FINANCIERE", label: "Location financière" },
  { key: "LONGUE_DUREE", label: "Longue durée" },
  { key: "ACHAT", label: "Achat" },
  { key: "ABONNEMENT", label: "Abonnements" },
];

const PARTENAIRES = [
  { key: "", label: "Tous partenaires" },
  { key: "GRENKE", label: "Grenke" },
  { key: "LOCAM", label: "Locam" },
  { key: "LEASECOM", label: "Leasecom" },
];

const typeLabels: Record<string, string> = {
  LOCATION_FINANCIERE: "Location financière",
  LONGUE_DUREE: "Longue durée",
  ACHAT: "Achat",
  ABONNEMENT: "Abonnement",
};

const typeColors: Record<string, string> = {
  LOCATION_FINANCIERE: "bg-blue-100 text-blue-800",
  LONGUE_DUREE: "bg-purple-100 text-purple-800",
  ACHAT: "bg-green-100 text-green-800",
  ABONNEMENT: "bg-orange-100 text-orange-800",
};

export default function ContratsListPage() {
  const [typeContrat, setTypeContrat] = useState("");
  const [partenaire, setPartenaire] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const showPartenaireFilter = typeContrat === "LOCATION_FINANCIERE" || typeContrat === "";

  const { data, isLoading } = useQuery({
    queryKey: ["contrats", { typeContrat, partenaire, search, page }],
    queryFn: () =>
      contratsApi.list({
        ...(typeContrat && { typeContrat }),
        ...(partenaire && { partenaire }),
        ...(search && { search }),
        page: String(page),
      }),
  });

  const contrats = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Contrats</h1>
        <Link
          to="/contrats/nouveau"
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus size={20} />
          Nouveau contrat
        </Link>
      </div>

      {/* Onglets par type */}
      <div className="flex gap-1 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setTypeContrat(tab.key);
              setPartenaire("");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium border-b-2 transition-colors ${
              typeContrat === tab.key
                ? "border-primary-600 text-primary-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
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
              placeholder="Rechercher par client, borne, numéro..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          {showPartenaireFilter && (
            <select
              value={partenaire}
              onChange={(e) => {
                setPartenaire(e.target.value);
                setPage(1);
              }}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
            >
              {PARTENAIRES.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Numéro
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Client
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Borne
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Mois
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Montant
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Loyer
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Dates
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                  Chargement...
                </td>
              </tr>
            ) : contrats.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                  Aucun contrat trouvé
                </td>
              </tr>
            ) : (
              contrats.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-primary-600 text-sm">
                    <Link to={`/contrats/${c.id}`} className="hover:underline">
                      {c.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        typeColors[c.typeContrat] ?? "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {typeLabels[c.typeContrat] ?? c.typeContrat}
                    </span>
                    {c.partenaire && (
                      <span className="ml-1 text-xs text-gray-500">
                        {c.partenaire}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div>{c.clientCrm ?? "—"}</div>
                    {c.clientPartenaire && c.clientPartenaire !== c.clientCrm && (
                      <div className="text-xs text-gray-400">
                        {c.clientPartenaire}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono">{c.numeroBorne ?? "—"}</td>
                  <td className="px-4 py-3 text-sm">{c.mois ?? "—"}</td>
                  <td className="px-4 py-3 text-sm">
                    {c.montant
                      ? `${Number(c.montant).toLocaleString("fr-FR")} €`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {c.loyer
                      ? `${Number(c.loyer).toLocaleString("fr-FR")} €/m`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {c.dateDebut
                      ? new Date(c.dateDebut).toLocaleDateString("fr-FR")
                      : "—"}
                    {c.dateFin && (
                      <>
                        {" → "}
                        {new Date(c.dateFin).toLocaleDateString("fr-FR")}
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/contrats/${c.id}`}
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

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-600">
              {pagination.total} contrat{pagination.total > 1 ? "s" : ""}
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
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
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
