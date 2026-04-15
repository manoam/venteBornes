import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ventesApi, clientsApi, usersApi, referenceApi } from "../lib/api";

type Step = "client" | "materiel" | "livraison" | "recap";
const STEPS: { key: Step; label: string }[] = [
  { key: "client", label: "Client & Facturation" },
  { key: "materiel", label: "Matériel" },
  { key: "livraison", label: "Livraison" },
  { key: "recap", label: "Récapitulatif" },
];

export default function VenteCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("client");
  const [form, setForm] = useState<Record<string, any>>({
    typeVente: "location",
    userId: 1,
  });

  const { data: users } = useQuery({ queryKey: ["users"], queryFn: usersApi.list });
  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsApi.list(),
  });
  const { data: gammes } = useQuery({
    queryKey: ["gammes"],
    queryFn: referenceApi.gammesBornes,
  });
  const { data: couleurs } = useQuery({
    queryKey: ["couleurs"],
    queryFn: referenceApi.couleurs,
  });
  const { data: pays } = useQuery({
    queryKey: ["pays"],
    queryFn: referenceApi.pays,
  });
  const { data: typesVentes } = useQuery({
    queryKey: ["types-ventes"],
    queryFn: referenceApi.typesVentes,
  });

  const createMutation = useMutation({
    mutationFn: ventesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ventes"] });
      navigate("/ventes");
    },
  });

  const update = (fields: Record<string, any>) =>
    setForm((prev) => ({ ...prev, ...fields }));

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);
  const isLast = currentStepIndex === STEPS.length - 1;

  const goNext = () => {
    if (isLast) {
      createMutation.mutate(form);
    } else {
      setStep(STEPS[currentStepIndex + 1].key);
    }
  };

  const goPrev = () => {
    if (currentStepIndex > 0) {
      setStep(STEPS[currentStepIndex - 1].key);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/ventes" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Nouvelle vente</h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <button
              onClick={() => i <= currentStepIndex && setStep(s.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                s.key === step
                  ? "bg-primary-600 text-white"
                  : i < currentStepIndex
                    ? "bg-primary-100 text-primary-700"
                    : "bg-gray-100 text-gray-500"
              }`}
            >
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs border border-current">
                {i < currentStepIndex ? <Check size={14} /> : i + 1}
              </span>
              {s.label}
            </button>
            {i < STEPS.length - 1 && (
              <div className="w-8 h-px bg-gray-300 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        {step === "client" && (
          <StepClient
            form={form}
            update={update}
            users={users ?? []}
            clients={clients?.data ?? []}
            typesVentes={typesVentes ?? []}
          />
        )}
        {step === "materiel" && (
          <StepMateriel
            form={form}
            update={update}
            gammes={gammes ?? []}
            couleurs={couleurs ?? []}
          />
        )}
        {step === "livraison" && (
          <StepLivraison form={form} update={update} pays={pays ?? []} />
        )}
        {step === "recap" && <StepRecap form={form} />}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={goPrev}
          disabled={currentStepIndex === 0}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Précédent
        </button>
        <button
          onClick={goNext}
          disabled={createMutation.isPending}
          className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {isLast ? (
            <>
              <Check size={16} />
              {createMutation.isPending ? "Enregistrement..." : "Créer la vente"}
            </>
          ) : (
            <>
              Suivant
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

      {createMutation.isError && (
        <p className="mt-4 text-red-600 text-sm">
          Erreur lors de la création de la vente.
        </p>
      )}
    </div>
  );
}

// ─── Step Components ────────────────────────────────────────

function StepClient({
  form,
  update,
  users,
  clients,
  typesVentes,
}: {
  form: Record<string, any>;
  update: (f: Record<string, any>) => void;
  users: any[];
  clients: any[];
  typesVentes: any[];
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Informations client</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Commercial *
          </label>
          <select
            value={form.userId ?? ""}
            onChange={(e) => update({ userId: Number(e.target.value) })}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Sélectionner</option>
            {users.map((u: any) => (
              <option key={u.id} value={u.id}>
                {u.prenom} {u.nom}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de vente *
          </label>
          <select
            value={form.typeVente ?? ""}
            onChange={(e) => {
              const code = e.target.value;
              const type = typesVentes.find((t: any) => t.code === code);
              update({ typeVente: code, typeVenteId: type?.id });
            }}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Sélectionner</option>
            {typesVentes.map((t: any) => (
              <option key={t.id} value={t.code}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client existant
          </label>
          <select
            value={form.clientId ?? ""}
            onChange={(e) =>
              update({ clientId: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Nouveau client</option>
            {clients.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.nom} {c.prenom ?? ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Montant HT (€)
          </label>
          <input
            type="number"
            value={form.facturationMontantHt ?? ""}
            onChange={(e) =>
              update({
                facturationMontantHt: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
            className="w-full border rounded-lg px-3 py-2"
            placeholder="0.00"
          />
        </div>
      </div>

      {!form.clientId && (
        <>
          <h3 className="text-md font-medium mt-4">Nouveau client</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nom" value={form.clientNom} onChange={(v) => update({ clientNom: v })} />
            <Input label="Prénom" value={form.clientPrenom} onChange={(v) => update({ clientPrenom: v })} />
            <Input label="Email" value={form.clientEmail} onChange={(v) => update({ clientEmail: v })} type="email" />
            <Input label="Téléphone" value={form.clientTelephone} onChange={(v) => update({ clientTelephone: v })} />
            <Input label="Adresse" value={form.clientAdresse} onChange={(v) => update({ clientAdresse: v })} />
            <Input label="Ville" value={form.clientVille} onChange={(v) => update({ clientVille: v })} />
            <Input label="Code postal" value={form.clientCp} onChange={(v) => update({ clientCp: v })} />
          </div>
        </>
      )}
    </div>
  );
}

function StepMateriel({
  form,
  update,
  gammes,
  couleurs,
}: {
  form: Record<string, any>;
  update: (f: Record<string, any>) => void;
  gammes: any[];
  couleurs: any[];
}) {
  const selectedGamme = gammes.find((g: any) => g.id === form.gammeBorneId);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Équipement</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gamme</label>
          <select
            value={form.gammeBorneId ?? ""}
            onChange={(e) =>
              update({
                gammeBorneId: e.target.value ? Number(e.target.value) : undefined,
                modelBorneId: undefined,
              })
            }
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Sélectionner</option>
            {gammes.map((g: any) => (
              <option key={g.id} value={g.id}>{g.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
          <select
            value={form.modelBorneId ?? ""}
            onChange={(e) =>
              update({ modelBorneId: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full border rounded-lg px-3 py-2"
            disabled={!selectedGamme}
          >
            <option value="">Sélectionner</option>
            {selectedGamme?.models?.map((m: any) => (
              <option key={m.id} value={m.id}>{m.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
          <select
            value={form.couleurBorneId ?? ""}
            onChange={(e) =>
              update({ couleurBorneId: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Sélectionner</option>
            {couleurs.map((c: any) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logiciel</label>
          <input
            value={form.logiciel ?? ""}
            onChange={(e) => update({ logiciel: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <h3 className="text-md font-medium">Options</h3>
      <div className="flex flex-wrap gap-4">
        <Checkbox label="Marque blanche" checked={form.isMarqueBlanche} onChange={(v) => update({ isMarqueBlanche: v })} />
        <Checkbox label="Gravure personnalisée" checked={form.isCustomGravure} onChange={(v) => update({ isCustomGravure: v })} />
        <Checkbox label="Valise transport" checked={form.isValiseTransport} onChange={(v) => update({ isValiseTransport: v })} />
        <Checkbox label="Housse protection" checked={form.isHousseProtection} onChange={(v) => update({ isHousseProtection: v })} />
        <Checkbox label="Sans imprimante" checked={form.isWithoutImprimante} onChange={(v) => update({ isWithoutImprimante: v })} />
      </div>
    </div>
  );
}

function StepLivraison({
  form,
  update,
  pays,
}: {
  form: Record<string, any>;
  update: (f: Record<string, any>) => void;
  pays: any[];
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Livraison</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de date
          </label>
          <select
            value={form.livraisonTypeDate ?? "EN_ATTENTE"}
            onChange={(e) => update({ livraisonTypeDate: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="EN_ATTENTE">En attente</option>
            <option value="AUSSITOT">Dès que possible</option>
            <option value="CLIENT">À définir avec le client</option>
            <option value="PRECIS">Date précise</option>
          </select>
        </div>
        {form.livraisonTypeDate === "PRECIS" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de livraison
            </label>
            <input
              type="datetime-local"
              value={form.livraisonDate ?? ""}
              onChange={(e) => update({ livraisonDate: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        )}
        <Input label="Adresse" value={form.livraisonAdresse} onChange={(v) => update({ livraisonAdresse: v })} />
        <Input label="Ville" value={form.livraisonVille} onChange={(v) => update({ livraisonVille: v })} />
        <Input label="Code postal" value={form.livraisonCp} onChange={(v) => update({ livraisonCp: v })} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
          <select
            value={form.livraisonPaysId ?? ""}
            onChange={(e) =>
              update({ livraisonPaysId: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Sélectionner</option>
            {pays.map((p: any) => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
        </div>
      </div>

      <h3 className="text-md font-medium">Contact livraison</h3>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Nom complet" value={form.livraisonContactFullname} onChange={(v) => update({ livraisonContactFullname: v })} />
        <Input label="Email" value={form.livraisonContactEmail} onChange={(v) => update({ livraisonContactEmail: v })} type="email" />
        <Input label="Tél. mobile" value={form.livraisonContactTelMobile} onChange={(v) => update({ livraisonContactTelMobile: v })} />
        <Input label="Tél. fixe" value={form.livraisonContactTelFixe} onChange={(v) => update({ livraisonContactTelFixe: v })} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Informations supplémentaires
        </label>
        <textarea
          value={form.livraisonInfosSup ?? ""}
          onChange={(e) => update({ livraisonInfosSup: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
          rows={3}
        />
      </div>
    </div>
  );
}

function StepRecap({ form }: { form: Record<string, any> }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Récapitulatif</h2>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Client</h3>
          <dl className="space-y-1 text-sm">
            <RecapRow label="Nom" value={form.clientNom} />
            <RecapRow label="Email" value={form.clientEmail} />
            <RecapRow label="Téléphone" value={form.clientTelephone} />
            <RecapRow label="Ville" value={form.clientVille} />
          </dl>
        </div>
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Matériel</h3>
          <dl className="space-y-1 text-sm">
            <RecapRow label="Type" value={form.typeVente} />
            <RecapRow label="Logiciel" value={form.logiciel} />
            {form.isMarqueBlanche && <RecapRow label="Option" value="Marque blanche" />}
            {form.isCustomGravure && <RecapRow label="Option" value="Gravure personnalisée" />}
          </dl>
        </div>
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Livraison</h3>
          <dl className="space-y-1 text-sm">
            <RecapRow label="Adresse" value={form.livraisonAdresse} />
            <RecapRow label="Ville" value={form.livraisonVille} />
            <RecapRow label="Contact" value={form.livraisonContactFullname} />
          </dl>
        </div>
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Facturation</h3>
          <dl className="space-y-1 text-sm">
            <RecapRow
              label="Montant HT"
              value={
                form.facturationMontantHt
                  ? `${form.facturationMontantHt} €`
                  : undefined
              }
            />
          </dl>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable form components ───────────────────────────────

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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2"
      />
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked ?? false}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

function RecapRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
