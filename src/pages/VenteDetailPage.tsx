import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Mail, Phone, MapPin } from "lucide-react";
import { ventesApi, referenceApi } from "../lib/api";
import StatusBadge from "../components/StatusBadge";

const colorMap: Record<string, { border: string; bg: string; title: string }> = {
  blue:   { border: "border-blue-200",   bg: "bg-blue-50",   title: "text-blue-800" },
  green:  { border: "border-green-200",  bg: "bg-green-50",  title: "text-green-800" },
  purple: { border: "border-purple-200", bg: "bg-purple-50", title: "text-purple-800" },
  orange: { border: "border-orange-200", bg: "bg-orange-50", title: "text-orange-800" },
  indigo: { border: "border-indigo-200", bg: "bg-indigo-50", title: "text-indigo-800" },
  teal:   { border: "border-teal-200",   bg: "bg-teal-50",   title: "text-teal-800" },
  gray:   { border: "border-gray-200",   bg: "bg-gray-50",   title: "text-gray-800" },
};

const livraisonTypeDateLabels: Record<string, string> = {
  EN_ATTENTE: "En attente",
  AUSSITOT: "Dès que possible",
  CLIENT: "À définir avec le client",
  PRECIS: "Date précise",
};

export default function VenteDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: vente, isLoading } = useQuery({
    queryKey: ["vente", id],
    queryFn: () => ventesApi.get(Number(id)),
    enabled: !!id,
  });

  const { data: typesVentes = [] } = useQuery({
    queryKey: ["types-ventes"],
    queryFn: referenceApi.typesVentes,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  if (!vente) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Vente non trouvée</p>
        <Link to="/ventes" className="text-primary-600 hover:underline mt-2 inline-block">
          Retour aux ventes
        </Link>
      </div>
    );
  }

  const options = [
    vente.isSousLocation && "Convention partenariat sous-location",
    vente.isAbonnementBo && "Abonnement BO",
  ].filter(Boolean);

  const materielOptions = [
    vente.isMarqueBlanche && "Marque blanche",
    vente.isCustomGravure && "Gravure personnalisée",
    vente.isValiseTransport && "Valise transport",
    vente.isHousseProtection && "Housse protection",
    vente.isWithoutImprimante && "Sans imprimante",
  ].filter(Boolean);

  return (
    <div>
      {/* ── Header ──────────────────────────────────── */}
      <div className="mb-8">
        <Link
          to="/ventes"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} />
          Retour aux ventes
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{vente.numero}</h1>
              <StatusBadge type="statut" value={vente.venteStatut} />
              <StatusBadge type="facturation" value={vente.etatFacturation} />
            </div>
            <p className="text-sm text-gray-500">
              Créée le{" "}
              {new Date(vente.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {vente.user && (
                <> · Commercial : <span className="font-medium">{vente.user.prenom} {vente.user.nom}</span></>
              )}
            </p>
          </div>
          <Link
            to={`/ventes/${vente.id}/modifier`}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
          >
            <Pencil size={16} />
            Modifier
          </Link>
        </div>
      </div>

      {/* ── Vente & Client ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Vente */}
        <RecapCard title="Vente" color="blue">
          <RecapField
            label="Type de vente"
            value={
              typesVentes.find((t: any) => t.code === vente.typeVente)?.label ??
              vente.typeVente
            }
          />
          <RecapField label="Nombre de mois" value={vente.nbMois ? `${vente.nbMois} mois` : undefined} />
          <RecapField
            label="Période"
            value={
              vente.contratDebut || vente.contratFin
                ? `${vente.contratDebut ? new Date(vente.contratDebut).toLocaleDateString("fr-FR") : "—"} → ${vente.contratFin ? new Date(vente.contratFin).toLocaleDateString("fr-FR") : "—"}`
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

        {/* Client — carte de visite */}
        <RecapCard title="Client" color="green">
          <div className="space-y-3">
            {/* Nom principal */}
            <p className="text-lg font-bold text-gray-900">
              {vente.client?.nom ?? vente.clientNom}
              {vente.clientType !== "corporation" && (vente.client?.prenom ?? vente.clientPrenom) && (
                <span className="font-normal"> {vente.client?.prenom ?? vente.clientPrenom}</span>
              )}
            </p>

            {/* Contact */}
            {(vente.client?.email ?? vente.clientEmail) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={14} className="text-gray-400" />
                <a href={`mailto:${vente.client?.email ?? vente.clientEmail}`} className="hover:text-primary-600">
                  {vente.client?.email ?? vente.clientEmail}
                </a>
              </div>
            )}
            {vente.clientTelephone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} className="text-gray-400" />
                <a href={`tel:${vente.clientTelephone}`} className="hover:text-primary-600">
                  {vente.clientTelephone}
                </a>
              </div>
            )}

            {/* Adresse */}
            {(vente.clientAdresse || vente.clientVille) && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin size={14} className="text-gray-400 mt-0.5" />
                <div>
                  {vente.clientAdresse && <p>{vente.clientAdresse}</p>}
                  <p>
                    {[vente.clientCp, vente.clientVille].filter(Boolean).join(" ")}
                    {vente.clientPays && vente.clientPays !== "France" && `, ${vente.clientPays}`}
                  </p>
                </div>
              </div>
            )}

            {vente.isAgence && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <span className="text-yellow-700 font-medium">Agence pour :</span> {vente.proprietaire}
              </div>
            )}
          </div>
        </RecapCard>
      </div>

      {/* ── Matériel ────────────────────────────────── */}
      <RecapCard title="Matériel" color="purple" className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <RecapField label="Gamme" value={vente.gammeBorne?.nom} />
            <RecapField label="Modèle" value={vente.modelBorne?.nom} />
            <RecapField label="Couleur" value={vente.couleur?.nom} />
            <RecapField label="Borne" value={vente.borne?.numero} />
            <RecapField label="Logiciel" value={vente.logiciel} />
            {vente.gravureNote && <RecapField label="Note gravure" value={vente.gravureNote} />}
            <RecapField label="Infos supplémentaires" value={vente.materielNote} />
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
            {vente.equipementVentes?.length > 0 && (
              <div className="mt-3">
                <span className="text-xs text-gray-500">Équipements</span>
                <div className="mt-1 space-y-1">
                  {vente.equipementVentes.map((ev: any) => (
                    <div key={ev.id} className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <span className="font-medium">{ev.typeEquipement?.nom}:</span>
                      {ev.aucun ? (
                        <span className="text-gray-400 italic">Aucun(e)</span>
                      ) : (
                        <span>
                          {ev.equipement?.valeur ?? "Non sélectionné"}
                          {ev.materielOccasion && <span className="ml-1 text-xs text-orange-600">(occasion)</span>}
                          {ev.valeurDefinir && <span className="ml-1 text-xs text-blue-600">(à définir)</span>}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </RecapCard>

      {/* ── Consommables ────────────────────────────── */}
      {vente.consommables?.length > 0 && (
        <RecapCard title="Consommables" color="orange" className="mb-6">
          <div className="space-y-2">
            {vente.consommables.map((c: any) => (
              <div key={c.id} className="flex justify-between items-center text-sm">
                <span>{c.typeConsommable?.nom} — {c.sousTypeConsommable?.nom}</span>
                <span className="font-medium">x{c.qty}</span>
              </div>
            ))}
          </div>
        </RecapCard>
      )}

      {/* ── Config Créa & Livraison ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Config Créa */}
        {(vente.isContactCreaDifferent || vente.configCreaNote) && (
          <RecapCard title="Contact Créa" color="indigo">
            <div className="space-y-3">
              {vente.isContactCreaDifferent && (
                <>
                  <p className="text-lg font-bold text-gray-900">
                    {[vente.contactCreaFullname, vente.contactCreaLastname].filter(Boolean).join(" ")}
                  </p>
                  {vente.contactCreaFonction && (
                    <p className="text-sm text-gray-500 -mt-2">{vente.contactCreaFonction}</p>
                  )}
                  {vente.contactCreaEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} className="text-gray-400" />
                      <a href={`mailto:${vente.contactCreaEmail}`} className="hover:text-primary-600">
                        {vente.contactCreaEmail}
                      </a>
                    </div>
                  )}
                  {(vente.contactCreaTelMobile || vente.contactCreaTelFixe) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} className="text-gray-400" />
                      <span>{vente.contactCreaTelMobile ?? vente.contactCreaTelFixe}</span>
                    </div>
                  )}
                </>
              )}
              {vente.configCreaNote && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500 mb-1">Note de configuration</p>
                  <p className="text-sm bg-indigo-50 rounded p-2">{vente.configCreaNote}</p>
                </div>
              )}
            </div>
          </RecapCard>
        )}

        {/* Livraison */}
        <RecapCard title="Contact Livraison" color="teal">
          <div className="space-y-3">
            {vente.isLivraisonDifferent && (
              <>
                <p className="text-lg font-bold text-gray-900">
                  {[vente.livraisonContactFullname, vente.livraisonContactLastname].filter(Boolean).join(" ")}
                </p>
                {vente.livraisonContactFonction && (
                  <p className="text-sm text-gray-500 -mt-2">{vente.livraisonContactFonction}</p>
                )}
                {vente.livraisonContactEmail && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={14} className="text-gray-400" />
                    <a href={`mailto:${vente.livraisonContactEmail}`} className="hover:text-primary-600">
                      {vente.livraisonContactEmail}
                    </a>
                  </div>
                )}
                {(vente.livraisonContactTelMobile || vente.livraisonContactTelFixe) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} className="text-gray-400" />
                    <span>{vente.livraisonContactTelMobile ?? vente.livraisonContactTelFixe}</span>
                  </div>
                )}
              </>
            )}

            {vente.isLivraisonAdresseDiff && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin size={14} className="text-gray-400 mt-0.5" />
                <div>
                  {vente.livraisonAdresse && <p>{vente.livraisonAdresse}</p>}
                  {vente.livraisonAdresseComp && <p>{vente.livraisonAdresseComp}</p>}
                  <p>{[vente.livraisonCp, vente.livraisonVille].filter(Boolean).join(" ")}</p>
                  {vente.livraisonPays && vente.livraisonPays !== "France" && <p>{vente.livraisonPays}</p>}
                </div>
              </div>
            )}

            {vente.livraisonContactNote && (
              <p className="text-sm text-gray-600 italic">"{vente.livraisonContactNote}"</p>
            )}

            {/* Dates livraison */}
            <div className="pt-2 border-t space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date souhaitée</span>
                <span className="font-medium">{livraisonTypeDateLabels[vente.livraisonTypeDate] ?? vente.livraisonTypeDate}</span>
              </div>
              {vente.livraisonDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date précise</span>
                  <span className="font-medium">{new Date(vente.livraisonDate).toLocaleDateString("fr-FR")}</span>
                </div>
              )}
              {vente.livraisonDateFirstUsage && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">1ère utilisation</span>
                  <span className="font-medium">{new Date(vente.livraisonDateFirstUsage).toLocaleDateString("fr-FR")}</span>
                </div>
              )}
              {vente.livraisonInfosSup && (
                <div className="pt-1">
                  <p className="text-xs text-gray-500">Infos supplémentaires</p>
                  <p className="text-sm">{vente.livraisonInfosSup}</p>
                </div>
              )}
            </div>
          </div>
        </RecapCard>
      </div>

      {/* ── Contrat lié ─────────────────────────────── */}
      {vente.contrat && (
        <RecapCard title="Contrat associé" color="gray" className="mb-6">
          <Link
            to={`/contrats/${vente.contrat.id}`}
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 font-medium bg-primary-50 px-4 py-2 rounded-lg transition-colors"
          >
            {vente.contrat.numero}
          </Link>
        </RecapCard>
      )}
    </div>
  );
}

// ─── Sub-components (même style que le récap) ───────────────

function RecapCard({
  title,
  color,
  className,
  children,
}: {
  title: string;
  color: string;
  className?: string;
  children: React.ReactNode;
}) {
  const c = colorMap[color] ?? colorMap.gray;
  return (
    <div className={`rounded-lg border ${c.border} overflow-hidden ${className ?? ""}`}>
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
