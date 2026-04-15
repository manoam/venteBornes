import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Info } from "lucide-react";
import { referenceApi } from "../lib/api";

interface Gamme {
  id: number;
  crmId: number;
  nom: string;
  updatedAt: string;
  models?: { id: number; nom: string }[];
}

export default function GammesPage() {
  const { data: gammes = [], isLoading, refetch, isFetching } = useQuery<Gamme[]>({
    queryKey: ["gammes-ref"],
    queryFn: referenceApi.gammesBornes,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gammes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Liste des gammes de bornes synchronisées depuis le CRM
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
            Les gammes sont gérées dans le CRM. Les modifications sont synchronisées
            automatiquement via RabbitMQ.
          </p>
        </div>
      </div>

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
                Modèles
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
            ) : gammes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  Aucune gamme — en attente de synchronisation depuis le CRM
                </td>
              </tr>
            ) : (
              gammes.map((gamme) => (
                <tr key={gamme.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-mono">
                      #{gamme.crmId}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-medium">{gamme.nom}</td>
                  <td className="px-6 py-3">
                    {gamme.models && gamme.models.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {gamme.models.map((m) => (
                          <span
                            key={m.id}
                            className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs"
                          >
                            {m.nom}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {gamme.updatedAt
                      ? new Date(gamme.updatedAt).toLocaleString("fr-FR", {
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
