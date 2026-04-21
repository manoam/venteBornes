import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ventesApi, clientsApi, usersApi, referenceApi } from "../lib/api";
import ClientSearchCrm from "../components/ClientSearchCrm";

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
  typesVentes,
}: {
  form: Record<string, any>;
  update: (f: Record<string, any>) => void;
  users: any[];
  typesVentes: any[];
}) {
  const tv = (form.typeVente ?? "").toLowerCase();
  const isLocaFi = tv !== "" && !tv.includes("achat");

  return (
    <div className="space-y-8">
      {/* ── Section Vente ─────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Vente</h2>
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
                  {u.prenom ? `${u.prenom} ${u.nom}` : u.nom}
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
                <option key={t.id} value={t.code}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Champs conditionnels — Location */}
          {isLocaFi && (
            <>
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
                      nbMois: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="12"
                />
              </div>
              <div />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date début
                </label>
                <input
                  type="date"
                  value={
                    form.contratDebut ? form.contratDebut.split("T")[0] : ""
                  }
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date fin
                </label>
                <input
                  type="date"
                  value={form.contratFin ? form.contratFin.split("T")[0] : ""}
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

        <div className="flex flex-wrap gap-6 pt-4">
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
      </div>

      {/* ── Section Client ────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Client</h2>

        {/* Recherche CRM */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rechercher un client *
          </label>
          <ClientSearchCrm
            selectedLabel={form.crmClientLabel}
            onSelect={async (crmId, label) => {
              update({
                crmClientId: crmId,
                crmClientLabel: label,
                clientId: undefined,
                crmClientLoading: true,
              });
              // Fetch les détails du client depuis le CRM
              try {
                const client = await clientsApi.getFromCrm(crmId);
                update({
                  crmClientLoading: false,
                  clientNom: client.nom ?? "",
                  clientPrenom: client.prenom ?? "",
                  clientEmail: client.email ?? "",
                  clientTelephone: client.telephone ?? "",
                  clientAdresse: client.adresse ?? "",
                  clientVille: client.ville ?? "",
                  clientCp: client.codePostal ?? "",
                  clientPays: client.pays ?? "France",
                });
              } catch {
                update({ crmClientLoading: false });
              }
            }}
            onClear={() =>
              update({
                crmClientId: undefined,
                crmClientLabel: undefined,
                crmClientLoading: false,
                clientId: undefined,
                clientNom: undefined,
                clientPrenom: undefined,
                clientEmail: undefined,
                clientTelephone: undefined,
                clientAdresse: undefined,
                clientVille: undefined,
                clientCp: undefined,
                clientPays: undefined,
                clientEnseigne: undefined,
                clientTelephone2: undefined,
                clientTvaIntra: undefined,
                clientSiren: undefined,
                clientSiret: undefined,
              })
            }
          />
        </div>

        {/* Chargement client CRM */}
        {form.crmClientLoading && (
          <div className="text-sm text-gray-500 py-4 text-center">
            Chargement des informations client...
          </div>
        )}

        {/* Infos client CRM (lecture seule) */}
        {form.crmClientId && !form.crmClientLoading && (
          <div className="border rounded-lg p-4 bg-blue-50 space-y-4">
            <h3 className="text-md font-medium text-blue-800">
              Infos client (depuis le CRM)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <ReadonlyField label="Raison sociale" value={form.clientNom} />
              <ReadonlyField label="Prénom" value={form.clientPrenom} />
              <ReadonlyField label="Email" value={form.clientEmail} />
              <ReadonlyField label="Téléphone" value={form.clientTelephone} />
              <ReadonlyField label="Adresse" value={form.clientAdresse} />
              <ReadonlyField
                label="CP / Ville"
                value={[form.clientCp, form.clientVille]
                  .filter(Boolean)
                  .join(" ")}
              />
              <ReadonlyField label="Pays" value={form.clientPays} />
            </div>
          </div>
        )}

        {/* Nouveau client (si pas de client CRM sélectionné) */}
        {!form.crmClientId && !form.clientId && (
          <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
            <h3 className="text-md font-medium">Nouveau client</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Genre
                </label>
                <select
                  value={form.clientType ?? "corporation"}
                  onChange={(e) => update({ clientType: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="corporation">Société</option>
                  <option value="particulier">Particulier</option>
                </select>
              </div>
              <div />

              <Input
                label="Raison sociale *"
                value={form.clientNom}
                onChange={(v) => update({ clientNom: v })}
              />
              <Input
                label="Enseigne"
                value={form.clientEnseigne}
                onChange={(v) => update({ clientEnseigne: v })}
              />
              <Input
                label="Adresse"
                value={form.clientAdresse}
                onChange={(v) => update({ clientAdresse: v })}
              />
              <Input
                label="Adresse complémentaire"
                value={form.clientAdresse2}
                onChange={(v) => update({ clientAdresse2: v })}
              />
              <Input
                label="Code postal"
                value={form.clientCp}
                onChange={(v) => update({ clientCp: v })}
              />
              <Input
                label="Ville"
                value={form.clientVille}
                onChange={(v) => update({ clientVille: v })}
              />
              <Input
                label="Pays"
                value={form.clientPays}
                onChange={(v) => update({ clientPays: v })}
              />
              <div />

              <Input
                label="Tél entreprise"
                value={form.clientTelephone}
                onChange={(v) => update({ clientTelephone: v })}
              />
              <Input
                label="2ème téléphone"
                value={form.clientTelephone2}
                onChange={(v) => update({ clientTelephone2: v })}
              />
              <Input
                label="Email général"
                value={form.clientEmail}
                onChange={(v) => update({ clientEmail: v })}
                type="email"
              />
              <div />

              <Input
                label="TVA Intracommunautaire"
                value={form.clientTvaIntra}
                onChange={(v) => update({ clientTvaIntra: v })}
              />
              <Input
                label="Siren"
                value={form.clientSiren}
                onChange={(v) => update({ clientSiren: v })}
              />
              <Input
                label="Siret"
                value={form.clientSiret}
                onChange={(v) => update({ clientSiret: v })}
              />
            </div>

            {/* Agence */}
            <Checkbox
              label="Est une agence"
              checked={form.isAgence}
              onChange={(v) => update({ isAgence: v })}
            />
            {form.isAgence && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pour le compte de qui ? *
                </label>
                <textarea
                  value={form.proprietaire ?? ""}
                  onChange={(e) => update({ proprietaire: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
            )}

            {/* Groupe client */}
            <Checkbox
              label="Appartient à un groupe de client"
              checked={form.isClientBelongsToGroup}
              onChange={(v) => update({ isClientBelongsToGroup: v })}
            />
            {form.isClientBelongsToGroup && (
              <Input
                label="Nom du groupe"
                value={form.groupeClientNom}
                onChange={(v) => update({ groupeClientNom: v })}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Section Devis (upload) ────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Documents devis</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              update({ devisFiles: [...(form.devisFiles ?? []), ...files] });
            }}
            className="hidden"
            id="devis-upload"
          />
          <label
            htmlFor="devis-upload"
            className="cursor-pointer text-primary-600 hover:text-primary-800 font-medium"
          >
            Cliquez pour ajouter des fichiers
          </label>
          <p className="text-xs text-gray-400 mt-1">
            PDF, DOC, DOCX, PNG, JPG (max 100 fichiers)
          </p>
          {form.devisFiles?.length > 0 && (
            <div className="mt-3 space-y-1">
              {form.devisFiles.map((f: File, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-gray-50 rounded px-3 py-1 text-sm"
                >
                  <span className="truncate">{f.name}</span>
                  <button
                    onClick={() => {
                      const files = [...form.devisFiles];
                      files.splice(i, 1);
                      update({ devisFiles: files });
                    }}
                    className="text-red-500 hover:text-red-700 ml-2 text-xs"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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

  // Charger les équipements dynamiquement quand la gamme change
  const { data: typeEquipements = [] } = useQuery({
    queryKey: ["equipements-by-gamme", form.gammeBorneId],
    queryFn: () => referenceApi.equipementsByGamme(form.gammeBorneId),
    enabled: !!form.gammeBorneId,
  });

  // State local pour les sélections d'équipements
  const equipementVentes: Record<
    number,
    { equipementId?: number; aucun: boolean; valeurDefinir: boolean; materielOccasion: boolean }
  > = form.equipementVentes ?? {};

  const updateEquipement = (
    typeId: number,
    field: string,
    value: any
  ) => {
    const current = equipementVentes[typeId] ?? {
      aucun: false,
      valeurDefinir: false,
      materielOccasion: false,
    };
    const next = { ...equipementVentes, [typeId]: { ...current, [field]: value } };
    // Si "aucun" coché, on vide l'équipement sélectionné
    if (field === "aucun" && value) {
      next[typeId].equipementId = undefined;
    }
    update({ equipementVentes: next });
  };

  return (
    <div className="space-y-8">
      {/* ── Descriptif borne ──────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Descriptif borne</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gamme
            </label>
            <select
              value={form.gammeBorneId ?? ""}
              onChange={(e) =>
                update({
                  gammeBorneId: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                  modelBorneId: undefined,
                  equipementVentes: {},
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Sélectionner</option>
              {gammes.map((g: any) => (
                <option key={g.id} value={g.id}>
                  {g.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type (Modèle)
            </label>
            <select
              value={form.modelBorneId ?? ""}
              onChange={(e) =>
                update({
                  modelBorneId: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              className="w-full border rounded-lg px-3 py-2"
              disabled={!selectedGamme}
            >
              <option value="">
                {selectedGamme
                  ? "Sélectionner"
                  : "Sélectionner en fonction de la gamme"}
              </option>
              {selectedGamme?.models?.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur
            </label>
            <select
              value={form.couleurBorneId ?? ""}
              onChange={(e) =>
                update({
                  couleurBorneId: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Sélectionner</option>
              {couleurs.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Équipements par type (dynamique selon gamme) ── */}
      {typeEquipements.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Équipements</h2>
          <div className="space-y-4">
            {typeEquipements.map((te: any) => {
              const sel = equipementVentes[te.id] ?? {
                aucun: false,
                valeurDefinir: false,
                materielOccasion: false,
              };
              return (
                <div
                  key={te.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <h4 className="font-medium mb-3">{te.nom}</h4>
                  <div className="grid grid-cols-4 gap-4 items-end">
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Modèle
                      </label>
                      <select
                        value={sel.equipementId ?? ""}
                        onChange={(e) =>
                          updateEquipement(
                            te.id,
                            "equipementId",
                            e.target.value
                              ? Number(e.target.value)
                              : undefined
                          )
                        }
                        disabled={sel.aucun}
                        className="w-full border rounded px-2 py-1.5 text-sm disabled:bg-gray-200 disabled:opacity-50"
                      >
                        <option value="">Sélectionner</option>
                        {te.equipements?.map((eq: any) => (
                          <option key={eq.id} value={eq.id}>
                            {eq.valeur}
                          </option>
                        ))}
                      </select>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={sel.valeurDefinir}
                        onChange={(e) =>
                          updateEquipement(
                            te.id,
                            "valeurDefinir",
                            e.target.checked
                          )
                        }
                        disabled={sel.aucun}
                        className="rounded"
                      />
                      Valeur à définir
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={sel.aucun}
                        onChange={(e) =>
                          updateEquipement(
                            te.id,
                            "aucun",
                            e.target.checked
                          )
                        }
                        className="rounded"
                      />
                      Aucun(e)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={sel.materielOccasion}
                        onChange={(e) =>
                          updateEquipement(
                            te.id,
                            "materielOccasion",
                            e.target.checked
                          )
                        }
                        disabled={sel.aucun}
                        className="rounded"
                      />
                      Matériel occasion
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Options borne ─────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Options borne</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marque blanche
            </label>
            <select
              value={form.isMarqueBlanche ? "1" : "0"}
              onChange={(e) =>
                update({ isMarqueBlanche: e.target.value === "1" })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="0">Non</option>
              <option value="1">Oui</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logiciel
            </label>
            <input
              value={form.logiciel ?? ""}
              onChange={(e) => update({ logiciel: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Checkbox
            label="Gravure personnalisée"
            checked={form.isCustomGravure}
            onChange={(v) => update({ isCustomGravure: v })}
          />
          {form.isCustomGravure && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note sur la gravure
              </label>
              <textarea
                value={form.gravureNote ?? ""}
                onChange={(e) => update({ gravureNote: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                rows={3}
              />
            </div>
          )}

          <Checkbox
            label="Valise transport"
            checked={form.isValiseTransport}
            onChange={(v) => update({ isValiseTransport: v })}
          />
          <Checkbox
            label="Housse protection"
            checked={form.isHousseProtection}
            onChange={(v) => update({ isHousseProtection: v })}
          />
          <Checkbox
            label="Sans imprimante"
            checked={form.isWithoutImprimante}
            onChange={(v) => update({ isWithoutImprimante: v })}
          />
        </div>

        {/* Infos supplémentaires */}
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
    <div className="space-y-8">
      {/* ── Contact livraison ─────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Contact livraison</h2>

        <Checkbox
          label="Livraison pour un contact différent"
          checked={form.isLivraisonDifferent}
          onChange={(v) => update({ isLivraisonDifferent: v })}
        />

        {form.isLivraisonDifferent && (
          <div className="border rounded-lg p-4 bg-gray-50 mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nom contact"
                value={form.livraisonContactFullname}
                onChange={(v) => update({ livraisonContactFullname: v })}
              />
              <Input
                label="Prénom du contact"
                value={form.livraisonContactLastname}
                onChange={(v) => update({ livraisonContactLastname: v })}
              />
              <Input
                label="Fonction dans l'entreprise"
                value={form.livraisonContactFonction}
                onChange={(v) => update({ livraisonContactFonction: v })}
              />
              <Input
                label="Email"
                value={form.livraisonContactEmail}
                onChange={(v) => update({ livraisonContactEmail: v })}
                type="email"
              />
              <Input
                label="Tél. portable"
                value={form.livraisonContactTelMobile}
                onChange={(v) => update({ livraisonContactTelMobile: v })}
              />
              <Input
                label="Tél. fixe"
                value={form.livraisonContactTelFixe}
                onChange={(v) => update({ livraisonContactTelFixe: v })}
              />
            </div>
          </div>
        )}

        {/* Adresse différente */}
        <div className="mt-4">
          <Checkbox
            label="Livraison dans un lieu différent"
            checked={form.isLivraisonAdresseDiff}
            onChange={(v) => update({ isLivraisonAdresseDiff: v })}
          />
        </div>

        {form.isLivraisonAdresseDiff && (
          <div className="border rounded-lg p-4 bg-gray-50 mt-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <Input
                  label="Adresse"
                  value={form.livraisonAdresse}
                  onChange={(v) => update({ livraisonAdresse: v })}
                />
              </div>
              <div className="col-span-2">
                <Input
                  label="Adresse complémentaire"
                  value={form.livraisonAdresseComp}
                  onChange={(v) => update({ livraisonAdresseComp: v })}
                />
              </div>
              <Input
                label="CP"
                value={form.livraisonCp}
                onChange={(v) => update({ livraisonCp: v })}
              />
              <Input
                label="Ville"
                value={form.livraisonVille}
                onChange={(v) => update({ livraisonVille: v })}
              />
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pays
                </label>
                <select
                  value={form.livraisonPaysId ?? ""}
                  onChange={(e) =>
                    update({
                      livraisonPaysId: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Sélectionner</option>
                  {pays.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Commentaire */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Commentaire
          </label>
          <textarea
            value={form.livraisonContactNote ?? ""}
            onChange={(e) => update({ livraisonContactNote: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
          />
        </div>
      </div>

      {/* ── Informations livraison ────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Informations livraison</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de livraison souhaitée *
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
              Date de 1ère utilisation de la borne
            </label>
            <input
              type="date"
              value={
                form.livraisonDateFirstUsage
                  ? form.livraisonDateFirstUsage.split("T")[0]
                  : ""
              }
              onChange={(e) =>
                update({
                  livraisonDateFirstUsage: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : undefined,
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="col-span-2">
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
      </div>
    </div>
  );
}

function StepRecap({ form }: { form: Record<string, any> }) {
  const livraisonTypeDateLabels: Record<string, string> = {
    EN_ATTENTE: "En attente",
    AUSSITOT: "Dès que possible",
    CLIENT: "À définir avec le client",
    PRECIS: "Date précise",
  };

  const options = [
    form.isSousLocation && "Convention partenariat sous-location",
    form.isAbonnementBo && "Abonnement BO",
  ].filter(Boolean);

  const materielOptions = [
    form.isMarqueBlanche && "Marque blanche",
    form.isCustomGravure && "Gravure personnalisée",
    form.isValiseTransport && "Valise transport",
    form.isHousseProtection && "Housse protection",
    form.isWithoutImprimante && "Sans imprimante",
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-xl font-bold">Récapitulatif de la vente</h2>
      </div>

      {/* ── Vente & Client ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vente */}
        <RecapCard title="Vente" color="blue">
          <RecapField label="Type de vente" value={form.typeVente} />
          <RecapField label="Nombre de mois" value={form.nbMois ? `${form.nbMois} mois` : undefined} />
          <RecapField
            label="Période"
            value={
              form.contratDebut || form.contratFin
                ? `${form.contratDebut ? new Date(form.contratDebut).toLocaleDateString("fr-FR") : "—"} → ${form.contratFin ? new Date(form.contratFin).toLocaleDateString("fr-FR") : "—"}`
                : undefined
            }
          />
          {options.length > 0 && (
            <div className="pt-2">
              <span className="text-xs text-gray-500">Options</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {options.map((o, i) => (
                  <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                    {o}
                  </span>
                ))}
              </div>
            </div>
          )}
        </RecapCard>

        {/* Client */}
        <RecapCard title="Client" color="green">
          {form.crmClientLabel ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <span className="text-xs text-green-600 font-medium">Client CRM</span>
              <p className="text-sm font-medium text-gray-900 mt-1">{form.crmClientLabel}</p>
            </div>
          ) : (
            <>
              <RecapField label="Raison sociale" value={form.clientNom} highlight />
              <RecapField label="Enseigne" value={form.clientEnseigne} />
              <RecapField label="Email" value={form.clientEmail} />
              <RecapField label="Téléphone" value={form.clientTelephone} />
              <RecapField
                label="Adresse"
                value={[form.clientAdresse, form.clientCp, form.clientVille, form.clientPays].filter(Boolean).join(", ")}
              />
              <RecapField label="Siren / Siret" value={[form.clientSiren, form.clientSiret].filter(Boolean).join(" / ")} />
            </>
          )}
          {form.isAgence && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <span className="text-yellow-700 font-medium">Agence pour :</span> {form.proprietaire}
            </div>
          )}
        </RecapCard>
      </div>

      {/* ── Matériel & Équipements ─────────────────── */}
      <RecapCard title="Matériel" color="purple" fullWidth>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <RecapField label="Logiciel" value={form.logiciel} />
            {form.gravureNote && <RecapField label="Note gravure" value={form.gravureNote} />}
            <RecapField label="Infos supplémentaires" value={form.materielNote} />
          </div>
          <div>
            {materielOptions.length > 0 && (
              <div>
                <span className="text-xs text-gray-500">Options matériel</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {materielOptions.map((o, i) => (
                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">
                      {o}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {form.equipementVentes && Object.keys(form.equipementVentes).length > 0 && (
              <div className="mt-3">
                <span className="text-xs text-gray-500">Équipements sélectionnés</span>
                <div className="mt-1 space-y-1">
                  {Object.entries(form.equipementVentes as Record<string, any>).map(
                    ([typeId, sel]: [string, any]) => (
                      <div key={typeId} className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        {sel.aucun ? (
                          <span className="text-gray-400 italic">Aucun(e)</span>
                        ) : (
                          <span>
                            {sel.equipementId ? `Équipement #${sel.equipementId}` : "Non sélectionné"}
                            {sel.materielOccasion && (
                              <span className="ml-1 text-xs text-orange-600">(occasion)</span>
                            )}
                            {sel.valeurDefinir && (
                              <span className="ml-1 text-xs text-blue-600">(à définir)</span>
                            )}
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </RecapCard>

      {/* ── Consommables ───────────────────────────── */}
      {form.isCartonBobine && form.consommablesSelection && (
        <RecapCard title="Options & Consommables" color="orange">
          {Object.entries(form.consommablesSelection as Record<string, any>)
            .filter(([, v]: [string, any]) => v.enabled)
            .map(([typeId, v]: [string, any]) => (
              <div key={typeId} className="space-y-1">
                {Object.entries(v.sousTypes as Record<string, number>)
                  .filter(([, qty]) => qty > 0)
                  .map(([stId, qty]) => (
                    <div key={stId} className="flex justify-between text-sm">
                      <span className="text-gray-600">Sous-type #{stId}</span>
                      <span className="font-medium">x{qty}</span>
                    </div>
                  ))}
              </div>
            ))}
          {form.materielOtherNote && (
            <div className="pt-2 border-t mt-2">
              <span className="text-xs text-gray-500">Notes</span>
              <p className="text-sm mt-1">{form.materielOtherNote}</p>
            </div>
          )}
        </RecapCard>
      )}

      {/* ── Config Créa ────────────────────────────── */}
      {(form.isContactCreaDifferent || form.configCreaNote) && (
        <RecapCard title="Config Créa" color="indigo">
          {form.isContactCreaDifferent && (
            <div className="grid grid-cols-2 gap-4">
              <RecapField
                label="Contact"
                value={[form.contactCreaFullname, form.contactCreaLastname].filter(Boolean).join(" ")}
              />
              <RecapField label="Fonction" value={form.contactCreaFonction} />
              <RecapField label="Email" value={form.contactCreaEmail} />
              <RecapField label="Tél." value={form.contactCreaTelMobile} />
            </div>
          )}
          {form.configCreaNote && (
            <div className="pt-2">
              <span className="text-xs text-gray-500">Note de configuration</span>
              <p className="text-sm mt-1 bg-indigo-50 rounded p-2">{form.configCreaNote}</p>
            </div>
          )}
        </RecapCard>
      )}

      {/* ── Livraison ──────────────────────────────── */}
      <RecapCard title="Livraison" color="teal" fullWidth>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            {form.isLivraisonDifferent && (
              <>
                <RecapField
                  label="Contact livraison"
                  value={[form.livraisonContactFullname, form.livraisonContactLastname].filter(Boolean).join(" ")}
                  highlight
                />
                <RecapField label="Fonction" value={form.livraisonContactFonction} />
                <RecapField label="Email" value={form.livraisonContactEmail} />
                <RecapField label="Tél." value={form.livraisonContactTelMobile} />
              </>
            )}
            {form.isLivraisonAdresseDiff && (
              <RecapField
                label="Adresse livraison"
                value={[form.livraisonAdresse, form.livraisonAdresseComp, form.livraisonCp, form.livraisonVille].filter(Boolean).join(", ")}
              />
            )}
            <RecapField label="Commentaire" value={form.livraisonContactNote} />
          </div>
          <div className="space-y-2">
            <RecapField
              label="Date souhaitée"
              value={livraisonTypeDateLabels[form.livraisonTypeDate] ?? form.livraisonTypeDate}
            />
            <RecapField
              label="Date précise"
              value={form.livraisonDate ? new Date(form.livraisonDate).toLocaleDateString("fr-FR") : undefined}
            />
            <RecapField
              label="1ère utilisation borne"
              value={form.livraisonDateFirstUsage ? new Date(form.livraisonDateFirstUsage).toLocaleDateString("fr-FR") : undefined}
            />
            <RecapField label="Infos supplémentaires" value={form.livraisonInfosSup} />
          </div>
        </div>
      </RecapCard>

      {/* Documents */}
      {form.devisFiles?.length > 0 && (
        <RecapCard title="Documents devis" color="gray">
          <div className="space-y-1">
            {form.devisFiles.map((f: File, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span>{f.name}</span>
              </div>
            ))}
          </div>
        </RecapCard>
      )}
    </div>
  );
}

// ─── Recap sub-components ───────────────────────────────────

const colorMap: Record<string, { border: string; bg: string; title: string }> = {
  blue:   { border: "border-blue-200",   bg: "bg-blue-50",   title: "text-blue-800" },
  green:  { border: "border-green-200",  bg: "bg-green-50",  title: "text-green-800" },
  purple: { border: "border-purple-200", bg: "bg-purple-50", title: "text-purple-800" },
  orange: { border: "border-orange-200", bg: "bg-orange-50", title: "text-orange-800" },
  indigo: { border: "border-indigo-200", bg: "bg-indigo-50", title: "text-indigo-800" },
  teal:   { border: "border-teal-200",   bg: "bg-teal-50",   title: "text-teal-800" },
  gray:   { border: "border-gray-200",   bg: "bg-gray-50",   title: "text-gray-800" },
};

function RecapCard({
  title,
  color,
  fullWidth,
  children,
}: {
  title: string;
  color: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}) {
  const c = colorMap[color] ?? colorMap.gray;
  return (
    <div className={`rounded-lg border ${c.border} overflow-hidden ${fullWidth ? "" : ""}`}>
      <div className={`px-5 py-3 ${c.bg} border-b ${c.border}`}>
        <h3 className={`font-semibold text-sm uppercase tracking-wide ${c.title}`}>
          {title}
        </h3>
      </div>
      <div className="px-5 py-4 bg-white space-y-3">{children}</div>
    </div>
  );
}

function RecapField({
  label,
  value,
  highlight,
}: {
  label: string;
  value?: string | null;
  highlight?: boolean;
}) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs text-gray-500">{label}</span>
      <p className={`text-sm ${highlight ? "font-semibold text-gray-900" : "text-gray-700"}`}>
        {value}
      </p>
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

function ReadonlyField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-blue-600 mb-1">
        {label}
      </label>
      <div className="text-sm font-medium text-gray-900 bg-white border border-blue-200 rounded-lg px-3 py-2">
        {value || "—"}
      </div>
    </div>
  );
}

