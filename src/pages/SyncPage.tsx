import { useState } from "react";
import { RefreshCw, Check, AlertCircle, Database } from "lucide-react";
import { syncApi } from "../lib/api";

interface SyncResult {
  total: number;
  created: number;
  updated: number;
  skipped?: number;
}

interface SyncState {
  loading: boolean;
  result?: SyncResult;
  error?: string;
}

const TABLES = [
  { key: "gammes", label: "Gammes de bornes", fn: syncApi.gammes },
  { key: "modeles", label: "Modèles de bornes", fn: syncApi.modeles },
  { key: "couleurs", label: "Couleurs", fn: syncApi.couleurs },
  { key: "typeEquipements", label: "Types d'équipements", fn: syncApi.typeEquipements },
  { key: "equipements", label: "Équipements", fn: syncApi.equipements },
  { key: "users", label: "Commerciaux", fn: syncApi.users },
] as const;

export default function SyncPage() {
  const [states, setStates] = useState<Record<string, SyncState>>({});
  const [allLoading, setAllLoading] = useState(false);

  const syncOne = async (key: string, fn: () => Promise<any>) => {
    setStates((s) => ({ ...s, [key]: { loading: true } }));
    try {
      const result = await fn();
      setStates((s) => ({
        ...s,
        [key]: { loading: false, result: result },
      }));
    } catch {
      setStates((s) => ({
        ...s,
        [key]: { loading: false, error: "Erreur lors de la synchronisation" },
      }));
    }
  };

  const syncAll = async () => {
    setAllLoading(true);
    try {
      const data = await syncApi.all();
      const results = data.results;
      setStates({
        gammes: { loading: false, result: results.gammes },
        modeles: { loading: false, result: results.modeles },
        users: { loading: false, result: results.users },
      });
    } catch {
      setStates({
        gammes: { loading: false, error: "Erreur" },
        modeles: { loading: false, error: "Erreur" },
        users: { loading: false, error: "Erreur" },
      });
    } finally {
      setAllLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Synchronisation CRM</h1>
          <p className="text-sm text-gray-500 mt-1">
            Importer les données de référence depuis le CRM
          </p>
        </div>
        <button
          onClick={syncAll}
          disabled={allLoading}
          className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={allLoading ? "animate-spin" : ""}
          />
          {allLoading ? "Synchronisation..." : "Tout synchroniser"}
        </button>
      </div>

      <div className="space-y-4">
        {TABLES.map(({ key, label, fn }) => {
          const state = states[key];
          return (
            <div
              key={key}
              className="bg-white rounded-lg shadow-sm border p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Database size={20} className="text-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium">{label}</h3>
                  {state?.result && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <Check size={14} />
                      {state.result.total} total — {state.result.created} créés,{" "}
                      {state.result.updated} mis à jour
                    </p>
                  )}
                  {state?.error && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {state.error}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => syncOne(key, fn)}
                disabled={state?.loading || allLoading}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
              >
                <RefreshCw
                  size={14}
                  className={state?.loading ? "animate-spin" : ""}
                />
                {state?.loading ? "Sync..." : "Synchroniser"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
