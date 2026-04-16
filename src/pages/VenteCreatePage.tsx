import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ventesApi, clientsApi, usersApi, referenceApi } from "../lib/api";

type Step = "client" | "materiel" | "consommables" | "configCrea" | "livraison" | "recap";
const STEPS: { key: Step; label: string }[] = [
  { key: "client", label: "Client & Facturation" },
  { key: "materiel", label: "Matériel" },
  { key: "consommables", label: "Options & Consommables" },
  { key: "configCrea", label: "Config Créa" },
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
  const { data: consommables } = useQuery({
    queryKey: ["consommables"],
    queryFn: referenceApi.consommables,
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
        {step === "consommables" && (
          <StepConsommables
            form={form}
            update={update}
            consommables={consommables ?? []}
          />
        )}
        {step === "configCrea" && (
          <StepConfigCrea form={form} update={update} />
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
            Nombre de mois
          </label>
          <input
            type="number"
            min="0"
            value={form.nbMois ?? ""}
            onChange={(e) =>
              update({
                nbMois: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full border rounded-lg px-3 py-2"
            placeholder="12"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date début
          </label>
          <input
            type="date"
            value={form.contratDebut ? form.contratDebut.split("T")[0] : ""}
            onChange={(e) =>
              update({
                contratDebut: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : undefined,
              })
            }
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6 pt-2">
        <Checkbox
          label="Convention de partenariat sous location"
          checked={form.isSousLocation}
          onChange={(v) => update({ isSousLocation: v })}
        />
        <Checkbox
          label="Abonnement BO"
          checked={form.isAbonnementBo}
          onChange={(v) => update({ isAbonnementBo: v })}
        />
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

function StepConsommables({
  form,
  update,
  consommables,
}: {
  form: Record<string, any>;
  update: (f: Record<string, any>) => void;
  consommables: any[];
}) {
  const isEnabled = form.isCartonBobine ?? false;

  // Initialise la structure consommables si pas encore faite
  const selectedConsommables: Record<
    number,
    { enabled: boolean; sousTypes: Record<number, number> }
  > = form.consommablesSelection ?? {};

  const updateSelection = (
    typeId: number,
    enabled: boolean,
    sousTypes?: Record<number, number>
  ) => {
    const next = { ...selectedConsommables };
    if (enabled) {
      next[typeId] = {
        enabled: true,
        sousTypes: sousTypes ?? next[typeId]?.sousTypes ?? {},
      };
    } else {
      next[typeId] = { enabled: false, sousTypes: {} };
    }
    update({ consommablesSelection: next });
  };

  const updateQty = (typeId: number, sousTypeId: number, qty: number) => {
    const current = selectedConsommables[typeId] ?? {
      enabled: true,
      sousTypes: {},
    };
    const next = {
      ...current,
      sousTypes: { ...current.sousTypes, [sousTypeId]: qty },
    };
    updateSelection(typeId, true, next.sousTypes);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Options & Consommables</h2>

      {/* Toggle principal */}
      <Checkbox
        label="Inclure des options complémentaires (consommables)"
        checked={isEnabled}
        onChange={(v) => update({ isCartonBobine: v })}
      />

      {/* Table consommables */}
      {isEnabled && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase w-1/3">
                  Type
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase w-1/3">
                  Déclinaison
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase w-1/3">
                  Quantité
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {consommables.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-gray-500 text-sm"
                  >
                    Aucun consommable disponible
                  </td>
                </tr>
              ) : (
                consommables.map((type: any) => {
                  const isTypeEnabled =
                    selectedConsommables[type.id]?.enabled ?? false;
                  return (
                    <ConsommableTypeRow
                      key={type.id}
                      type={type}
                      isEnabled={isTypeEnabled}
                      sousTypesQty={
                        selectedConsommables[type.id]?.sousTypes ?? {}
                      }
                      onToggle={(v) => updateSelection(type.id, v)}
                      onQtyChange={(sousTypeId, qty) =>
                        updateQty(type.id, sousTypeId, qty)
                      }
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Note libre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Autre (notes complémentaires)
        </label>
        <textarea
          value={form.materielOtherNote ?? ""}
          onChange={(e) => update({ materielOtherNote: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
          rows={4}
          placeholder="Notes supplémentaires..."
        />
      </div>
    </div>
  );
}

function ConsommableTypeRow({
  type,
  isEnabled,
  sousTypesQty,
  onToggle,
  onQtyChange,
}: {
  type: any;
  isEnabled: boolean;
  sousTypesQty: Record<number, number>;
  onToggle: (v: boolean) => void;
  onQtyChange: (sousTypeId: number, qty: number) => void;
}) {
  return (
    <>
      {/* Ligne type (parent) */}
      <tr className="bg-gray-50">
        <td colSpan={3} className="px-4 py-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => onToggle(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="font-medium text-sm">{type.nom}</span>
          </label>
        </td>
      </tr>
      {/* Lignes sous-types (enfants) */}
      {isEnabled &&
        (type.sousTypes ?? []).map((st: any) => (
          <tr key={st.id} className="hover:bg-gray-50">
            <td className="px-4 py-2" />
            <td className="px-4 py-2 text-sm text-gray-700">{st.nom}</td>
            <td className="px-4 py-2">
              <input
                type="number"
                min="0"
                value={sousTypesQty[st.id] ?? ""}
                onChange={(e) =>
                  onQtyChange(
                    st.id,
                    e.target.value ? Number(e.target.value) : 0
                  )
                }
                className="w-24 border rounded px-2 py-1 text-sm"
                placeholder="0"
              />
            </td>
          </tr>
        ))}
    </>
  );
}

function StepConfigCrea({
  form,
  update,
}: {
  form: Record<string, any>;
  update: (f: Record<string, any>) => void;
}) {
  const isDifferentContact = form.isContactCreaDifferent ?? false;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Config Créa</h2>

      {/* Toggle contact différent */}
      <Checkbox
        label="Contact différent que le contact principal ?"
        checked={isDifferentContact}
        onChange={(v) => update({ isContactCreaDifferent: v })}
      />

      {/* Champs contact création */}
      {isDifferentContact && (
        <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
          <h3 className="text-md font-medium">Contact création</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nom du contact"
              value={form.contactCreaFullname}
              onChange={(v) => update({ contactCreaFullname: v })}
            />
            <Input
              label="Prénom du contact"
              value={form.contactCreaLastname}
              onChange={(v) => update({ contactCreaLastname: v })}
            />
            <Input
              label="Fonction dans l'entreprise"
              value={form.contactCreaFonction}
              onChange={(v) => update({ contactCreaFonction: v })}
            />
            <Input
              label="Email"
              value={form.contactCreaEmail}
              onChange={(v) => update({ contactCreaEmail: v })}
              type="email"
            />
            <Input
              label="Tél. portable"
              value={form.contactCreaTelMobile}
              onChange={(v) => update({ contactCreaTelMobile: v })}
            />
            <Input
              label="Tél. fixe"
              value={form.contactCreaTelFixe}
              onChange={(v) => update({ contactCreaTelFixe: v })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commentaire optionnel
            </label>
            <textarea
              value={form.contactCreaNote ?? ""}
              onChange={(e) => update({ contactCreaNote: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Note de configuration (toujours visible) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Note de configuration
        </label>
        <textarea
          value={form.configCreaNote ?? ""}
          onChange={(e) => update({ configCreaNote: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
          rows={5}
          placeholder="Notes de configuration pour la création..."
        />
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
          <h3 className="font-medium text-gray-700 mb-2">Contrat</h3>
          <dl className="space-y-1 text-sm">
            <RecapRow
              label="Nombre de mois"
              value={form.nbMois ? String(form.nbMois) : undefined}
            />
            <RecapRow
              label="Date début"
              value={
                form.contratDebut
                  ? new Date(form.contratDebut).toLocaleDateString("fr-FR")
                  : undefined
              }
            />
            {form.isSousLocation && (
              <RecapRow label="Option" value="Convention partenariat sous-location" />
            )}
            {form.isAbonnementBo && <RecapRow label="Option" value="Abonnement BO" />}
          </dl>
        </div>
        {form.isCartonBobine && form.consommablesSelection && (
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Consommables</h3>
            <dl className="space-y-1 text-sm">
              {Object.entries(form.consommablesSelection as Record<string, any>)
                .filter(([, v]: [string, any]) => v.enabled)
                .map(([typeId, v]: [string, any]) => (
                  <div key={typeId}>
                    {Object.entries(v.sousTypes as Record<string, number>)
                      .filter(([, qty]) => qty > 0)
                      .map(([stId, qty]) => (
                        <RecapRow
                          key={stId}
                          label={`Sous-type #${stId}`}
                          value={`x${qty}`}
                        />
                      ))}
                  </div>
                ))}
              {form.materielOtherNote && (
                <RecapRow label="Notes" value={form.materielOtherNote} />
              )}
            </dl>
          </div>
        )}
        {(form.isContactCreaDifferent || form.configCreaNote) && (
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Config Créa</h3>
            <dl className="space-y-1 text-sm">
              {form.contactCreaFullname && (
                <RecapRow
                  label="Contact créa"
                  value={`${form.contactCreaFullname ?? ""} ${form.contactCreaLastname ?? ""}`}
                />
              )}
              {form.contactCreaEmail && (
                <RecapRow label="Email créa" value={form.contactCreaEmail} />
              )}
              {form.contactCreaFonction && (
                <RecapRow label="Fonction" value={form.contactCreaFonction} />
              )}
              {form.configCreaNote && (
                <RecapRow label="Note config" value={form.configCreaNote} />
              )}
            </dl>
          </div>
        )}
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
