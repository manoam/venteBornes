import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Info } from "lucide-react";
import { referenceApi } from "../lib/api";

export default function CouleursPage() {
  const { data: couleurs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["couleurs-ref"],
    queryFn: referenceApi.couleurs,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Couleurs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Liste des couleurs synchronisées depuis le CRM
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
            Les couleurs sont gérées dans le CRM. Les modifications sont
            synchronisées automatiquement via RabbitMQ.
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
                Aperçu
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                  Chargement...
                </td>
              </tr>
            ) : couleurs.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                  Aucune couleur — lancez la synchronisation CRM
                </td>
              </tr>
            ) : (
              couleurs.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-mono">
                      #{c.crmId ?? c.id}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-medium">{c.nom}</td>
                  <td className="px-6 py-3">
                    {c.hex ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-xs text-gray-500 font-mono">
                          {c.hex}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
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
