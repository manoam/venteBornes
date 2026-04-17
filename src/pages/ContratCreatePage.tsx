import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { contratsApi } from "../lib/api";

export default function ContratCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, any>>({
    typeContrat: "LOCATION_FINANCIERE",
  });

  const update = (fields: Record<string, any>) =>
    setForm((prev) => ({ ...prev, ...fields }));

  const createMutation = useMutation({
    mutationFn: contratsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contrats"] });
      navigate("/contrats");
    },
  });

  const showPartenaire = form.typeContrat === "LOCATION_FINANCIERE";

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/contrats" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Nouveau contrat</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        {/* Type & Partenaire */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de contrat *
            </label>
            <select
              value={form.typeContrat}
              onChange={(e) =>
                update({ typeContrat: e.target.value, partenaire: null })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="LOCATION_FINANCIERE">Location financière</option>
              <option value="LONGUE_DUREE">Longue durée</option>
              <option value="ACHAT">Achat</option>
              <option value="ABONNEMENT">Abonnement logiciel</option>
            </select>
          </div>
          {showPartenaire && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partenaire
              </label>
              <select
                value={form.partenaire ?? ""}
                onChange={(e) =>
                  update({
                    partenaire: e.target.value || null,
                  })
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Sélectionner</option>
                <option value="GRENKE">Grenke</option>
                <option value="LOCAM">Locam</option>
                <option value="LEASECOM">Leasecom</option>
              </select>
            </div>
          )}
        </div>

        {/* Client */}
        <h3 className="text-md font-medium">Client</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Client partenaire"
            value={form.clientPartenaire}
            onChange={(v) => update({ clientPartenaire: v })}
          />
          <Input
            label="Client CRM"
            value={form.clientCrm}
            onChange={(v) => update({ clientCrm: v })}
          />
          <Input
            label="Email contact"
            value={form.contactEmail}
            onChange={(v) => update({ contactEmail: v })}
            type="email"
          />
          <Input
            label="Commercial"
            value={form.commercial}
            onChange={(v) => update({ commercial: v })}
          />
        </div>

        {/* Borne */}
        <Input
          label="N° Borne"
          value={form.numeroBorne}
          onChange={(v) => update({ numeroBorne: v })}
        />

        {/* Financier */}
        <h3 className="text-md font-medium">Financier</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de mois
            </label>
            <input
              type="number"
              min="0"
              value={form.mois ?? ""}
              onChange={(e) =>
                update({ mois: e.target.value ? Number(e.target.value) : null })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant total (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.montant ?? ""}
              onChange={(e) =>
                update({
                  montant: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loyer mensuel (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.loyer ?? ""}
              onChange={(e) =>
                update({
                  loyer: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date début
            </label>
            <input
              type="date"
              value={form.dateDebut ?? ""}
              onChange={(e) =>
                update({
                  dateDebut: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date fin
            </label>
            <input
              type="date"
              value={form.dateFin ?? ""}
              onChange={(e) =>
                update({
                  dateFin: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Achat spécifique */}
        {form.typeContrat === "ACHAT" && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.abonnementLogiciel ?? false}
              onChange={(e) =>
                update({ abonnementLogiciel: e.target.checked })
              }
              className="rounded"
            />
            <span className="text-sm">Abonnement logiciel inclus</span>
          </label>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end mt-6">
        <button
          onClick={() => createMutation.mutate(form)}
          disabled={createMutation.isPending}
          className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <Check size={16} />
          {createMutation.isPending ? "Enregistrement..." : "Créer le contrat"}
        </button>
      </div>

      {createMutation.isError && (
        <p className="mt-4 text-red-600 text-sm">
          Erreur lors de la création du contrat.
        </p>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2"
      />
    </div>
  );
}
