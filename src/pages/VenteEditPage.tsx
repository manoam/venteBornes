import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ventesApi, usersApi, referenceApi } from "../lib/api";
import ClientSearchCrm from "../components/ClientSearchCrm";
import SearchableSelect from "../components/SearchableSelect";
import GoogleAddressAutocomplete from "../components/GoogleAddressAutocomplete";

type Step = "client" | "materiel" | "livraison" | "recap";
const STEPS: { key: Step; label: string }[] = [
  { key: "client", label: "Client & Facturation" },
  { key: "materiel", label: "Matériel" },
  { key: "livraison", label: "Livraison" },
  { key: "recap", label: "Récapitulatif" },
];

/**
 * Convertit les données de la vente (API) vers le format du formulaire.
 */
function venteToForm(vente: any): Record<string, any> {
  return {
    userId: vente.userId,
    typeVente: vente.typeVente,
    partenaire: vente.partenaire ?? undefined,
    clientPartenaire: vente.clientPartenaire ?? undefined,
    nbMois: vente.nbMois ?? undefined,
    contratDebut: vente.contratDebut ?? undefined,
    contratFin: vente.contratFin ?? undefined,
    isSousLocation: vente.isSousLocation ?? false,
    isAbonnementBo: vente.isAbonnementBo ?? false,

    // Client
    crmClientId: vente.client?.crmId ?? undefined,
    crmClientLabel: vente.client
      ? `${vente.client.nom} ${vente.client.prenom ?? ""}`.trim()
      : undefined,
    clientId: vente.clientId ?? undefined,
    clientNom: vente.clientNom ?? vente.client?.nom ?? undefined,
    clientPrenom: vente.clientPrenom ?? vente.client?.prenom ?? undefined,
    clientEmail: vente.clientEmail ?? vente.client?.email ?? undefined,
    clientTelephone: vente.clientTelephone ?? vente.client?.telephone ?? undefined,
    clientAdresse: vente.clientAdresse ?? vente.client?.adresse ?? undefined,
    clientVille: vente.clientVille ?? vente.client?.ville ?? undefined,
    clientCp: vente.clientCp ?? vente.client?.codePostal ?? undefined,
    clientPays: vente.clientPays ?? vente.client?.pays ?? undefined,

    // Matériel
    gammeBorneId: vente.gammeBorneId ?? undefined,
    modelBorneId: vente.modelBorneId ?? undefined,
    couleurBorneId: vente.couleurBorneId ?? undefined,
    isMarqueBlanche: vente.isMarqueBlanche ?? false,
    isCustomGravure: vente.isCustomGravure ?? false,
    gravureNote: vente.gravureNote ?? undefined,
    materielNote: vente.materielNote ?? undefined,
    logiciel: vente.logiciel ?? undefined,

    // Livraison
    isLivraisonDifferent: vente.isLivraisonDifferent ?? false,
    livraisonContactFullname: vente.livraisonContactFullname ?? undefined,
    livraisonContactLastname: vente.livraisonContactLastname ?? undefined,
    livraisonContactFonction: vente.livraisonContactFonction ?? undefined,
    livraisonContactEmail: vente.livraisonContactEmail ?? undefined,
    livraisonContactTelMobile: vente.livraisonContactTelMobile ?? undefined,
    livraisonContactTelFixe: vente.livraisonContactTelFixe ?? undefined,
    isLivraisonAdresseDiff: vente.isLivraisonAdresseDiff ?? false,
    livraisonAdresse: vente.livraisonAdresse ?? undefined,
    livraisonAdresseComp: vente.livraisonAdresseComp ?? undefined,
    livraisonCp: vente.livraisonCp ?? undefined,
    livraisonVille: vente.livraisonVille ?? undefined,
    livraisonPaysId: vente.livraisonPaysId ?? undefined,
    livraisonContactNote: vente.livraisonContactNote ?? undefined,
    livraisonTypeDate: vente.livraisonTypeDate ?? "EN_ATTENTE",
    livraisonDate: vente.livraisonDate ?? undefined,
    livraisonDateFirstUsage: vente.livraisonDateFirstUsage ?? undefined,
    livraisonInfosSup: vente.livraisonInfosSup ?? undefined,

    // Config Créa
    isContactCreaDifferent: vente.isContactCreaDifferent ?? false,
    contactCreaFullname: vente.contactCreaFullname ?? undefined,
    contactCreaLastname: vente.contactCreaLastname ?? undefined,
    contactCreaFonction: vente.contactCreaFonction ?? undefined,
    contactCreaEmail: vente.contactCreaEmail ?? undefined,
    contactCreaTelMobile: vente.contactCreaTelMobile ?? undefined,
    contactCreaTelFixe: vente.contactCreaTelFixe ?? undefined,
    contactCreaNote: vente.contactCreaNote ?? undefined,
    configCreaNote: vente.configCreaNote ?? undefined,
  };
}

export default function VenteEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("client");
  const [form, setForm] = useState<Record<string, any> | null>(null);

  const { data: vente, isLoading: venteLoading } = useQuery({
    queryKey: ["vente", id],
    queryFn: () => ventesApi.get(Number(id)),
    enabled: !!id,
  });

  const { data: users } = useQuery({ queryKey: ["users"], queryFn: usersApi.list });
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

  // Pré-remplir le formulaire quand la vente est chargée
  useEffect(() => {
    if (vente && !form) {
      setForm(venteToForm(vente));
    }
  }, [vente, form]);

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, any>) =>
      ventesApi.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ventes"] });
      queryClient.invalidateQueries({ queryKey: ["vente", id] });
      navigate(`/ventes/${id}`);
    },
  });

  if (venteLoading || !form) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  const update = (fields: Record<string, any>) =>
    setForm((prev) => (prev ? { ...prev, ...fields } : fields));

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);
  const isLast = currentStepIndex === STEPS.length - 1;
  const selectedGamme = (gammes ?? []).find(
    (g: any) => g.id === form.gammeBorneId
  );
  const tv = (form.typeVente ?? "").toLowerCase();
  const isLocaFi = tv !== "" && !tv.includes("achat");

  const goNext = () => {
    if (isLast) {
      updateMutation.mutate(form);
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
        <Link
          to={`/ventes/${id}`}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            Modifier {vente?.numero}
          </h1>
          <p className="text-sm text-gray-500">
            Modifiez les informations et enregistrez
          </p>
        </div>
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
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-4">Vente</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commercial *
                  </label>
                  <SearchableSelect
                    options={(users ?? []).map((u: any) => ({
                      value: u.id,
                      label: u.prenom ? `${u.prenom} ${u.nom}` : u.nom,
                    }))}
                    value={form.userId}
                    onChange={(v) => update({ userId: v ? Number(v) : undefined })}
                    placeholder="Sélectionner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de vente *
                  </label>
                  <SearchableSelect
                    options={(typesVentes ?? []).map((t: any) => ({
                      value: t.code,
                      label: t.label,
                    }))}
                    value={form.typeVente}
                    onChange={(v) => {
                      const code = v ? String(v) : "";
                      const type = (typesVentes ?? []).find(
                        (t: any) => t.code === code
                      );
                      update({ typeVente: code, typeVenteId: type?.id });
                    }}
                    placeholder="Sélectionner"
                  />
                </div>
                {isLocaFi && (
                  <>
                    {(tv.includes("financ") ||
                      tv.includes("loca_fi") ||
                      tv.includes("locafi")) && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Partenaire
                          </label>
                          <SearchableSelect
                            options={[
                              { value: "GRENKE", label: "Grenke" },
                              { value: "LOCAM", label: "Locam" },
                              { value: "LEASECOM", label: "Leasecom" },
                            ]}
                            value={form.partenaire}
                            onChange={(v) =>
                              update({
                                partenaire: v ? String(v) : undefined,
                              })
                            }
                            placeholder="Sélectionner"
                          />
                        </div>
                        {form.partenaire && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Client chez{" "}
                              {form.partenaire.charAt(0) +
                                form.partenaire.slice(1).toLowerCase()}
                            </label>
                            <input
                              type="text"
                              value={form.clientPartenaire ?? ""}
                              onChange={(e) =>
                                update({
                                  clientPartenaire: e.target.value,
                                })
                              }
                              className="w-full border rounded-lg px-3 py-2"
                            />
                          </div>
                        )}
                      </>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de mois
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.nbMois ?? ""}
                        onChange={(e) => {
                          const mois = e.target.value
                            ? Number(e.target.value)
                            : undefined;
                          const updates: Record<string, any> = {
                            nbMois: mois,
                          };
                          if (mois && form.contratDebut) {
                            const d = new Date(form.contratDebut);
                            d.setMonth(d.getMonth() + mois);
                            updates.contratFin = d.toISOString();
                          }
                          update(updates);
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date début
                      </label>
                      <input
                        type="date"
                        value={
                          form.contratDebut
                            ? form.contratDebut.split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          const updates: Record<string, any> = {
                            contratDebut: e.target.value
                              ? new Date(e.target.value).toISOString()
                              : undefined,
                          };
                          if (e.target.value && form.nbMois) {
                            const d = new Date(e.target.value);
                            d.setMonth(d.getMonth() + Number(form.nbMois));
                            updates.contratFin = d.toISOString();
                          }
                          update(updates);
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date fin
                      </label>
                      <input
                        type="date"
                        value={
                          form.contratFin
                            ? form.contratFin.split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          update({
                            contratFin: e.target.value
                              ? new Date(e.target.value).toISOString()
                              : undefined,
                          })
                        }
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Client */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Client</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client
                </label>
                <ClientSearchCrm
                  selectedLabel={form.crmClientLabel}
                  onSelect={async (crmId, label) => {
                    update({
                      crmClientId: crmId,
                      crmClientLabel: label,
                    });
                  }}
                  onClear={() =>
                    update({
                      crmClientId: undefined,
                      crmClientLabel: undefined,
                    })
                  }
                />
              </div>
              {form.crmClientLabel && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <p className="text-sm font-medium text-blue-800">
                    {form.crmClientLabel}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === "materiel" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-4">Descriptif borne</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gamme
                  </label>
                  <SearchableSelect
                    options={(gammes ?? []).map((g: any) => ({
                      value: g.id,
                      label: g.nom,
                    }))}
                    value={form.gammeBorneId}
                    onChange={(v) =>
                      update({
                        gammeBorneId: v ? Number(v) : undefined,
                        modelBorneId: undefined,
                      })
                    }
                    placeholder="Sélectionner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modèle
                  </label>
                  <SearchableSelect
                    options={(selectedGamme?.models ?? []).map((m: any) => ({
                      value: m.id,
                      label: m.nom,
                    }))}
                    value={form.modelBorneId}
                    onChange={(v) =>
                      update({ modelBorneId: v ? Number(v) : undefined })
                    }
                    placeholder="Sélectionner"
                    disabled={!selectedGamme}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur
                  </label>
                  <SearchableSelect
                    options={(couleurs ?? []).map((c: any) => ({
                      value: c.id,
                      label: c.nom,
                    }))}
                    value={form.couleurBorneId}
                    onChange={(v) =>
                      update({
                        couleurBorneId: v ? Number(v) : undefined,
                      })
                    }
                    placeholder="Sélectionner"
                  />
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4">Options borne</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isMarqueBlanche ?? false}
                    onChange={(e) =>
                      update({ isMarqueBlanche: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Marque blanche</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isCustomGravure ?? false}
                    onChange={(e) =>
                      update({ isCustomGravure: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Gravure personnalisée</span>
                </label>
                {form.isCustomGravure && (
                  <textarea
                    value={form.gravureNote ?? ""}
                    onChange={(e) => update({ gravureNote: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Note sur la gravure"
                  />
                )}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Informations supplémentaires
                </label>
                <textarea
                  value={form.materielNote ?? ""}
                  onChange={(e) => update({ materielNote: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {step === "livraison" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-4">Livraison</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de livraison souhaitée *
                  </label>
                  <SearchableSelect
                    options={[
                      { value: "EN_ATTENTE", label: "En attente" },
                      { value: "AUSSITOT", label: "Dès que possible" },
                      { value: "CLIENT", label: "À définir avec le client" },
                      { value: "PRECIS", label: "Date précise" },
                    ]}
                    value={form.livraisonTypeDate ?? "EN_ATTENTE"}
                    onChange={(v) =>
                      update({
                        livraisonTypeDate: v ? String(v) : "EN_ATTENTE",
                      })
                    }
                    placeholder="Sélectionner"
                  />
                </div>
                {form.livraisonTypeDate === "PRECIS" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date précise
                    </label>
                    <input
                      type="date"
                      value={
                        form.livraisonDate
                          ? form.livraisonDate.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        update({
                          livraisonDate: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : undefined,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Informations supplémentaires
                  </label>
                  <textarea
                    value={form.livraisonInfosSup ?? ""}
                    onChange={(e) =>
                      update({ livraisonInfosSup: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "recap" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              Confirmer les modifications
            </h2>
            <p className="text-sm text-gray-600">
              Vérifiez les informations puis cliquez sur "Enregistrer".
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="font-medium">Vente</h3>
                <p>Type : {form.typeVente}</p>
                {form.partenaire && <p>Partenaire : {form.partenaire}</p>}
                {form.nbMois && <p>Durée : {form.nbMois} mois</p>}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="font-medium">Client</h3>
                <p>{form.crmClientLabel ?? form.clientNom ?? "—"}</p>
                {form.clientEmail && <p>{form.clientEmail}</p>}
              </div>
            </div>
          </div>
        )}
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
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {isLast ? (
            <>
              <Check size={16} />
              {updateMutation.isPending
                ? "Enregistrement..."
                : "Enregistrer"}
            </>
          ) : (
            <>
              Suivant
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

      {updateMutation.isError && (
        <p className="mt-4 text-red-600 text-sm">
          Erreur lors de la mise à jour.
        </p>
      )}
    </div>
  );
}
