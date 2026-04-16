import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Info, Search } from "lucide-react";
import { referenceApi } from "../lib/api";

interface Model {
  id: number;
  crmId: number;
  nom: string;
  gammeRefId: number | null;
  updatedAt: string;
}

interface Gamme {
  id: number;
  crmId: number;
  nom: string;
  models: Model[];
  updatedAt: string;
}

export default function ModelesPage() {
  const [search, setSearch] = useState("");
  const [gammeFilter, setGammeFilter] = useState<string>("");

  const { data: gammes = [], isLoading, refetch, isFetching } = useQuery<Gamme[]>({
    queryKey: ["gammes-ref"],
    queryFn: referenceApi.gammesBornes,
  });

  // Flatten tous les modèles avec le nom de leur gamme
  const allModels = useMemo(() => {
    const list: (Model & { gammeNom: string | null })[] = [];
    for (const g of gammes) {
      for (const m of g.models ?? []) {
        list.push({ ...m, gammeNom: g.nom });
      }
    }
    return list;
  }, [gammes]);

  const filtered = useMemo(() => {
    return allModels.filter((m) => {
      if (search && !m.nom.toLowerCase().includes(search.toLowerCase())) return false;
      if (gammeFilter && String(m.gammeRefId) !== gammeFilter) return false;
      return true;
    });
  }, [allModels, search, gammeFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Modèles</h1>
          <p className="text-sm text-gray-500 mt-1">
            Liste des modèles de bornes synchronisés depuis le CRM
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
        <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium">Lecture seule</p>
          <p className="text-blue-700 mt-1">
            Les modèles sont gérés dans le CRM. Les modifications sont synchronisées
            automatiquement via RabbitMQ.
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un modèle..."
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={gammeFilter}
            onChange={(e) => setGammeFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Toutes les gammes</option>
            {gammes.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nom}
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
                CRM ID
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Nom
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Gamme
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Dernière sync
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  Chargement...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  {allModels.length === 0
                    ? "Aucun modèle — en attente de synchronisation depuis le CRM"
                    : "Aucun résultat"}
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-mono">
                      #{m.crmId}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-medium">{m.nom}</td>
                  <td className="px-6 py-3">
                    {m.gammeNom ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs">
                        {m.gammeNom}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {m.updatedAt
                      ? new Date(m.updatedAt).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
