import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Send,
  Trash2,
  FileText,
  User,
  CreditCard,
  Calendar,
  Monitor,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { contratsApi } from "../lib/api";

const typeLabels: Record<string, string> = {
  LOCATION_FINANCIERE: "Location financière",
  LONGUE_DUREE: "Longue durée",
  ACHAT: "Achat",
  ABONNEMENT: "Abonnement",
};

const typeColors: Record<string, { badge: string; accent: string }> = {
  LOCATION_FINANCIERE: {
    badge: "bg-blue-100 text-blue-800 border-blue-200",
    accent: "border-blue-500",
  },
  LONGUE_DUREE: {
    badge: "bg-purple-100 text-purple-800 border-purple-200",
    accent: "border-purple-500",
  },
  ACHAT: {
    badge: "bg-green-100 text-green-800 border-green-200",
    accent: "border-green-500",
  },
  ABONNEMENT: {
    badge: "bg-orange-100 text-orange-800 border-orange-200",
    accent: "border-orange-500",
  },
};

export default function ContratDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  const { data: contrat, isLoading } = useQuery({
    queryKey: ["contrat", id],
    queryFn: () => contratsApi.get(Number(id)),
    enabled: !!id,
  });

  const addCommentMutation = useMutation({
    mutationFn: (contenu: string) =>
      contratsApi.addCommentaire(Number(id), { contenu }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contrat", id] });
      setNewComment("");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) =>
      contratsApi.deleteCommentaire(Number(id), commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contrat", id] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  if (!contrat) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Contrat non trouvé</p>
        <Link to="/contrats" className="text-primary-600 hover:underline mt-2 inline-block">
          Retour aux contrats
        </Link>
      </div>
    );
  }

  const tc = typeColors[contrat.typeContrat] ?? typeColors.ACHAT;
  const isExpired =
    contrat.dateFin && new Date(contrat.dateFin) < new Date();
  const daysLeft = contrat.dateFin
    ? Math.ceil(
        (new Date(contrat.dateFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div>
      {/* ── Header ──────────────────────────────────────── */}
      <div className="mb-8">
        <Link
          to="/contrats"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} />
          Retour aux contrats
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{contrat.numero}</h1>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${tc.badge}`}
              >
                {typeLabels[contrat.typeContrat] ?? contrat.typeContrat}
              </span>
              {contrat.partenaire && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  {contrat.partenaire}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Créé le{" "}
              {new Date(contrat.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Statut durée */}
          {daysLeft !== null && (
            <div
              className={`text-right px-4 py-2 rounded-lg ${
                isExpired
                  ? "bg-red-50 border border-red-200"
                  : daysLeft < 30
                    ? "bg-yellow-50 border border-yellow-200"
                    : "bg-green-50 border border-green-200"
              }`}
            >
              <p
                className={`text-lg font-bold ${
                  isExpired
                    ? "text-red-600"
                    : daysLeft < 30
                      ? "text-yellow-600"
                      : "text-green-600"
                }`}
              >
                {isExpired ? "Expiré" : `${daysLeft}j restants`}
              </p>
              <p className="text-xs text-gray-500">
                Fin :{" "}
                {new Date(contrat.dateFin).toLocaleDateString("fr-FR")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="Durée"
          value={contrat.mois ? `${contrat.mois} mois` : "—"}
          icon={<Calendar size={20} />}
        />
        <KpiCard
          label="Montant total"
          value={
            contrat.montant
              ? `${Number(contrat.montant).toLocaleString("fr-FR")} €`
              : "—"
          }
          icon={<CreditCard size={20} />}
        />
        <KpiCard
          label="Loyer mensuel"
          value={
            contrat.loyer
              ? `${Number(contrat.loyer).toLocaleString("fr-FR")} €`
              : "—"
          }
          icon={<CreditCard size={20} />}
          accent
        />
        <KpiCard
          label="N° Borne"
          value={contrat.numeroBorne ?? "—"}
          icon={<Monitor size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Colonne principale ────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client */}
          <DetailCard
            title="Client"
            icon={<User size={18} />}
            accentColor={tc.accent}
          >
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Client CRM
                </span>
                <div className="mt-0.5 flex items-center gap-2">
                  <p className="text-base font-semibold text-gray-900">
                    {contrat.clientCrm ?? "—"}
                  </p>
                  {contrat.vente?.client?.crmId && (
                    <a
                      href={`${import.meta.env.VITE_CRM_URL}/fr/clients/fiche/${contrat.vente.client.crmId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800"
                      title="Voir la fiche dans le CRM"
                    >
                      <ExternalLink size={12} />
                      CRM
                    </a>
                  )}
                </div>
              </div>
              <DetailField
                label="Client partenaire"
                value={contrat.clientPartenaire}
              />
              <DetailField label="Email" value={contrat.contactEmail} />
              <DetailField label="Commercial" value={contrat.commercial} />
            </div>
          </DetailCard>

          {/* Financier & Dates */}
          <DetailCard
            title="Détails financiers"
            icon={<CreditCard size={18} />}
            accentColor={tc.accent}
          >
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <DetailField
                label="Montant total"
                value={
                  contrat.montant
                    ? `${Number(contrat.montant).toLocaleString("fr-FR")} €`
                    : null
                }
                large
              />
              <DetailField
                label="Loyer mensuel"
                value={
                  contrat.loyer
                    ? `${Number(contrat.loyer).toLocaleString("fr-FR")} €/mois`
                    : null
                }
                large
              />
              <DetailField
                label="Durée"
                value={contrat.mois ? `${contrat.mois} mois` : null}
              />
              {contrat.typeContrat === "ACHAT" && (
                <DetailField
                  label="Abonnement logiciel"
                  value={contrat.abonnementLogiciel ? "Oui" : "Non"}
                />
              )}
            </div>

            {/* Timeline dates */}
            {(contrat.dateDebut || contrat.dateFin) && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <span className="text-xs text-gray-500">Début</span>
                    <p className="text-sm font-medium">
                      {contrat.dateDebut
                        ? new Date(contrat.dateDebut).toLocaleDateString(
                            "fr-FR",
                            { day: "numeric", month: "long", year: "numeric" }
                          )
                        : "—"}
                    </p>
                  </div>
                  <div className="flex-1 h-1 bg-gray-200 rounded-full relative">
                    {contrat.dateDebut && contrat.dateFin && (
                      <div
                        className={`absolute top-0 left-0 h-full rounded-full ${
                          isExpired ? "bg-red-400" : "bg-primary-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              5,
                              ((Date.now() -
                                new Date(contrat.dateDebut).getTime()) /
                                (new Date(contrat.dateFin).getTime() -
                                  new Date(contrat.dateDebut).getTime())) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1 text-right">
                    <span className="text-xs text-gray-500">Fin</span>
                    <p
                      className={`text-sm font-medium ${
                        isExpired ? "text-red-600" : ""
                      }`}
                    >
                      {contrat.dateFin
                        ? new Date(contrat.dateFin).toLocaleDateString(
                            "fr-FR",
                            { day: "numeric", month: "long", year: "numeric" }
                          )
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DetailCard>

          {/* Vente source */}
          {contrat.vente && (
            <DetailCard
              title="Vente source"
              icon={<FileText size={18} />}
              accentColor={tc.accent}
            >
              <Link
                to={`/ventes/${contrat.vente.id}`}
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 font-medium bg-primary-50 px-4 py-2 rounded-lg transition-colors"
              >
                <FileText size={16} />
                {contrat.vente.numero}
              </Link>
            </DetailCard>
          )}
        </div>

        {/* ── Colonne commentaires ──────────────────────── */}
        <div>
          <div
            className={`bg-white rounded-lg shadow-sm border-l-4 ${tc.accent} border border-gray-200 overflow-hidden`}
          >
            <div className="px-5 py-4 bg-gray-50 border-b flex items-center gap-2">
              <MessageSquare size={18} className="text-gray-500" />
              <h2 className="font-semibold">
                Commentaires
                {contrat.commentaires?.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    ({contrat.commentaires.length})
                  </span>
                )}
              </h2>
            </div>

            {/* Formulaire ajout */}
            <div className="p-4 border-b">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newComment.trim()) {
                      addCommentMutation.mutate(newComment.trim());
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newComment.trim()) {
                      addCommentMutation.mutate(newComment.trim());
                    }
                  }}
                  disabled={
                    !newComment.trim() || addCommentMutation.isPending
                  }
                  className="p-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>

            {/* Liste */}
            <div className="max-h-[500px] overflow-y-auto">
              {contrat.commentaires?.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <MessageSquare
                    size={32}
                    className="mx-auto text-gray-300 mb-2"
                  />
                  <p className="text-gray-400 text-sm">Aucun commentaire</p>
                </div>
              ) : (
                <div className="divide-y">
                  {contrat.commentaires?.map((c: any) => (
                    <div
                      key={c.id}
                      className="px-5 py-3 group hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-sm text-gray-800">{c.contenu}</p>
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-xs text-gray-400">
                          {c.auteur && (
                            <span className="font-medium text-gray-500">
                              {c.auteur} ·{" "}
                            </span>
                          )}
                          {new Date(c.createdAt).toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <button
                          onClick={() => {
                            if (confirm("Supprimer ce commentaire ?")) {
                              deleteCommentMutation.mutate(c.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        accent ? "bg-primary-50 border-primary-200" : "bg-white"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-gray-400">{icon}</span>
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p
        className={`text-xl font-bold ${
          accent ? "text-primary-700" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DetailCard({
  title,
  icon,
  accentColor,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-l-4 ${accentColor} border border-gray-200 overflow-hidden`}
    >
      <div className="px-6 py-4 border-b bg-gray-50 flex items-center gap-2">
        <span className="text-gray-500">{icon}</span>
        <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-700">
          {title}
        </h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function DetailField({
  label,
  value,
  large,
}: {
  label: string;
  value?: string | null;
  large?: boolean;
}) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs text-gray-500 uppercase tracking-wide">
        {label}
      </span>
      <p
        className={`mt-0.5 ${
          large ? "text-base font-semibold text-gray-900" : "text-sm text-gray-700"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
