import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../lib/api";
import StatusBadge from "../components/StatusBadge";

export default function FacturationsPage() {
  const [showArchive, setShowArchive] = useState(false);

  const { data: ventes = [], isLoading } = useQuery({
    queryKey: ["facturations", showArchive],
    queryFn: () => dashboardApi.facturations(showArchive),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Facturations</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowArchive(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              !showArchive
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            En cours
          </button>
          <button
            onClick={() => setShowArchive(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              showArchive
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Archivées
          </button>
        </div>
      </div>

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
                Parc
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Montant HT
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                État facturation
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Commercial
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Chargement...
                </td>
              </tr>
            ) : ventes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Aucune facturation
                </td>
              </tr>
            ) : (
              ventes.map((v: any) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      to={`/ventes/${v.id}`}
                      className="font-medium text-primary-600 hover:underline"
                    >
                      {v.numero}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {v.client?.nom} {v.client?.prenom ?? ""}
                  </td>
                  <td className="px-6 py-4 text-sm">{v.parc?.nom ?? "—"}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {v.facturationMontantHt
                      ? `${Number(v.facturationMontantHt).toLocaleString("fr-FR")} €`
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge type="facturation" value={v.etatFacturation} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {v.user?.prenom} {v.user?.nom}
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
