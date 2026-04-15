import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { parametresApi } from "../lib/api";

interface TypeVente {
  id: number;
  code: string;
  label: string;
  ordre: number;
  actif: boolean;
}

export default function TypesVentesPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<Partial<TypeVente>>({});
  const [error, setError] = useState<string | null>(null);

  const { data: types = [], isLoading } = useQuery<TypeVente[]>({
    queryKey: ["param-types-ventes"],
    queryFn: parametresApi.typesVentes.list,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["param-types-ventes"] });
    queryClient.invalidateQueries({ queryKey: ["types-ventes"] });
  };

  const createMutation = useMutation({
    mutationFn: parametresApi.typesVentes.create,
    onSuccess: () => {
      invalidate();
      cancel();
    },
    onError: (e: any) => setError(e?.response?.data?.error ?? "Erreur"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      parametresApi.typesVentes.update(id, data),
    onSuccess: () => {
      invalidate();
      cancel();
    },
    onError: (e: any) => setError(e?.response?.data?.error ?? "Erreur"),
  });

  const deleteMutation = useMutation({
    mutationFn: parametresApi.typesVentes.delete,
    onSuccess: invalidate,
    onError: (e: any) => alert(e?.response?.data?.error ?? "Erreur"),
  });

  const startEdit = (type: TypeVente) => {
    setError(null);
    setEditingId(type.id);
    setForm(type);
  };

  const startCreate = () => {
    setError(null);
    setEditingId("new");
    setForm({ code: "", label: "", ordre: (types.length + 1) * 10, actif: true });
  };

  const cancel = () => {
    setEditingId(null);
    setForm({});
    setError(null);
  };

  const save = () => {
    setError(null);
    if (!form.code || !form.label) {
      setError("Code et label requis");
      return;
    }
    const payload = {
      code: form.code,
      label: form.label,
      ordre: Number(form.ordre ?? 0),
      actif: form.actif ?? true,
    };
    if (editingId === "new") {
      createMutation.mutate(payload);
    } else if (typeof editingId === "number") {
      updateMutation.mutate({ id: editingId, data: payload });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Types de vente</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérer les types de vente disponibles dans l'application
          </p>
        </div>
        <button
          onClick={startCreate}
          disabled={editingId !== null}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <Plus size={20} />
          Nouveau type
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Code
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Label
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Ordre
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Actif
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Chargement...
                </td>
              </tr>
            ) : (
              <>
                {editingId === "new" && (
                  <EditRow form={form} setForm={setForm} onSave={save} onCancel={cancel} />
                )}
                {types.length === 0 && editingId !== "new" ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Aucun type de vente — cliquez sur "Nouveau type" pour en créer un
                    </td>
                  </tr>
                ) : (
                  types.map((type) =>
                    editingId === type.id ? (
                      <EditRow
                        key={type.id}
                        form={form}
                        setForm={setForm}
                        onSave={save}
                        onCancel={cancel}
                      />
                    ) : (
                      <tr key={type.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-mono text-sm">{type.code}</td>
                        <td className="px-6 py-3">{type.label}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{type.ordre}</td>
                        <td className="px-6 py-3">
                          {type.actif ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                              Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                              Inactif
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => startEdit(type)}
                              disabled={editingId !== null}
                              className="p-1.5 text-gray-500 hover:text-primary-600 disabled:opacity-50"
                              title="Éditer"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Supprimer "${type.label}" ?`)) {
                                  deleteMutation.mutate(type.id);
                                }
                              }}
                              disabled={editingId !== null}
                              className="p-1.5 text-gray-500 hover:text-red-600 disabled:opacity-50"
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditRow({
  form,
  setForm,
  onSave,
  onCancel,
}: {
  form: Partial<TypeVente>;
  setForm: (f: Partial<TypeVente>) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <tr className="bg-primary-50">
      <td className="px-6 py-3">
        <input
          value={form.code ?? ""}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          placeholder="location"
          className="w-full border rounded px-2 py-1 text-sm font-mono"
        />
      </td>
      <td className="px-6 py-3">
        <input
          value={form.label ?? ""}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          placeholder="Location"
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </td>
      <td className="px-6 py-3">
        <input
          type="number"
          value={form.ordre ?? 0}
          onChange={(e) => setForm({ ...form, ordre: Number(e.target.value) })}
          className="w-20 border rounded px-2 py-1 text-sm"
        />
      </td>
      <td className="px-6 py-3">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.actif ?? true}
            onChange={(e) => setForm({ ...form, actif: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">{form.actif ?? true ? "Actif" : "Inactif"}</span>
        </label>
      </td>
      <td className="px-6 py-3 text-right">
        <div className="inline-flex gap-2">
          <button
            onClick={onSave}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
            title="Enregistrer"
          >
            <Check size={16} />
          </button>
          <button
            onClick={onCancel}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
            title="Annuler"
          >
            <X size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
