import { useState } from "react";
import { Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react";
import api from "../lib/api";

interface SheetResult {
  total: number;
  created: number;
  errors: number;
}

interface ImportResult {
  success: boolean;
  totalCreated: number;
  sheets: Record<string, SheetResult>;
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/import/contrats", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(response.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ?? "Erreur lors de l'import"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Import de données</h1>
        <p className="text-sm text-gray-500 mt-1">
          Importer les contrats depuis un fichier Excel
        </p>
      </div>

      {/* Upload zone */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Import Contrats (Excel)</h2>
        <p className="text-sm text-gray-600 mb-4">
          Le fichier doit contenir les onglets : <strong>GRENKE</strong>,{" "}
          <strong>LOCAM</strong>, <strong>LEASECOM</strong>,{" "}
          <strong>LONGUE DURÉE</strong>, <strong>ACHAT</strong>,{" "}
          <strong>ABONNEMENTS</strong>
        </p>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setResult(null);
              setError(null);
            }}
            className="hidden"
            id="excel-upload"
          />
          <label htmlFor="excel-upload" className="cursor-pointer">
            <FileSpreadsheet
              size={48}
              className="mx-auto text-gray-400 mb-3"
            />
            {file ? (
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / 1024).toFixed(1)} Ko
                </p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-primary-600">
                  Cliquez pour sélectionner un fichier
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Formats acceptés : .xlsx, .xls
                </p>
              </div>
            )}
          </label>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleImport}
            disabled={!file || isLoading}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <Upload size={18} />
            {isLoading ? "Import en cours..." : "Lancer l'import"}
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle
            size={20}
            className="text-red-600 flex-shrink-0 mt-0.5"
          />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Résultats */}
      {result && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 bg-green-50 border-b border-green-200 flex items-center gap-3">
            <Check size={20} className="text-green-600" />
            <div>
              <p className="font-semibold text-green-800">
                Import terminé — {result.totalCreated} contrats créés
              </p>
            </div>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Onglet
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Lignes
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Créés
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Erreurs
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Object.entries(result.sheets).map(([name, sheet]) => (
                <tr key={name} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">{name}</td>
                  <td className="px-6 py-3 text-right text-sm text-gray-600">
                    {sheet.total}
                  </td>
                  <td className="px-6 py-3 text-right text-sm">
                    <span className="text-green-600 font-medium">
                      {sheet.created}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-sm">
                    {sheet.errors > 0 ? (
                      <span className="text-red-600 font-medium">
                        {sheet.errors}
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
