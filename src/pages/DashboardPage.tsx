import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../lib/api";

const statutLabels: Record<string, string> = {
  EN_ATTENTE: "En attente",
  EN_PREPA: "En préparation",
  PRET_EXP: "Prête à expédier",
  EXPEDIE: "Expédiée",
  RECEPTIONNE: "Réceptionné",
};

const statutColors: Record<string, string> = {
  EN_ATTENTE: "bg-yellow-500",
  EN_PREPA: "bg-blue-500",
  PRET_EXP: "bg-purple-500",
  EXPEDIE: "bg-orange-500",
  RECEPTIONNE: "bg-green-500",
};

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardApi.stats,
  });

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Chargement...</div>;
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-500">Aucune donnée</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <KpiCard title="Total ventes" value={data.totalVentes} />
        {data.ventesParStatut?.map((s: any) => (
          <KpiCard
            key={s.venteStatut}
            title={statutLabels[s.venteStatut] ?? s.venteStatut}
            value={s._count}
            color={statutColors[s.venteStatut]}
          />
        ))}
      </div>

      {/* Ventes par mois */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Ventes par mois (12 derniers mois)</h2>
        {data.ventesParMois && data.ventesParMois.length > 0 ? (
          <div className="space-y-3">
            {data.ventesParMois.map((m: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-24">
                  {new Date(m.mois).toLocaleDateString("fr-FR", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-primary-500 h-full rounded-full flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.max(
                        5,
                        (Number(m.total) /
                          Math.max(
                            ...data.ventesParMois.map((x: any) => Number(x.total))
                          )) *
                          100
                      )}%`,
                    }}
                  >
                    <span className="text-xs text-white font-medium">{m.total}</span>
                  </div>
                </div>
                <span className="text-sm font-medium w-28 text-right">
                  {Number(m.ca).toLocaleString("fr-FR")} €
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Aucune donnée disponible</p>
        )}
      </div>

      {/* Ventes par commercial */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Par commercial</h2>
        {data.ventesParUser && data.ventesParUser.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-sm text-gray-500">User ID</th>
                <th className="text-right py-2 text-sm text-gray-500">Nb ventes</th>
                <th className="text-right py-2 text-sm text-gray-500">CA HT</th>
              </tr>
            </thead>
            <tbody>
              {data.ventesParUser.map((u: any) => (
                <tr key={u.userId} className="border-b last:border-0">
                  <td className="py-2 text-sm">Commercial #{u.userId}</td>
                  <td className="py-2 text-sm text-right">{u._count}</td>
                  <td className="py-2 text-sm text-right font-medium">
                    {Number(u._sum?.facturationMontantHt ?? 0).toLocaleString("fr-FR")} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-sm">Aucune donnée disponible</p>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-3">
        {color && <div className={`w-3 h-3 rounded-full ${color}`} />}
        <span className="text-sm text-gray-500">{title}</span>
      </div>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
