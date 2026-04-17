import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, Trash2, FileText } from "lucide-react";
import { contratsApi } from "../lib/api";

const typeLabels: Record<string, string> = {
  LOCATION_FINANCIERE: "Location financière",
  LONGUE_DUREE: "Longue durée",
  ACHAT: "Achat",
  ABONNEMENT: "Abonnement",
};

const typeColors: Record<string, string> = {
  LOCATION_FINANCIERE: "bg-blue-100 text-blue-800",
  LONGUE_DUREE: "bg-purple-100 text-purple-800",
  ACHAT: "bg-green-100 text-green-800",
  ABONNEMENT: "bg-orange-100 text-orange-800",
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
    return <div className="text-center py-12 text-gray-500">Chargement...</div>;
  }

  if (!contrat) {
    return (
      <div className="text-center py-12 text-gray-500">Contrat non trouvé</div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/contrats"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{contrat.numero}</h1>
            <p className="text-sm text-gray-500">
              Créé le{" "}
              {new Date(contrat.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              typeColors[contrat.typeContrat] ?? "bg-gray-100"
            }`}
          >
            {typeLabels[contrat.typeContrat] ?? contrat.typeContrat}
          </span>
          {contrat.partenaire && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
              {contrat.partenaire}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Infos principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client */}
          <Section title="Client">
            <Field label="Client CRM" value={contrat.clientCrm} />
            <Field label="Client partenaire" value={contrat.clientPartenaire} />
            <Field label="Email contact" value={contrat.contactEmail} />
            <Field label="Commercial" value={contrat.commercial} />
          </Section>

          {/* Équipement */}
          <Section title="Équipement">
            <Field label="N° Borne" value={contrat.numeroBorne} />
            {contrat.typeContrat === "ACHAT" && (
              <Field
                label="Abonnement logiciel"
                value={contrat.abonnementLogiciel ? "Oui" : "Non"}
              />
            )}
          </Section>

          {/* Financier */}
          <Section title="Financier">
            <Field label="Durée" value={contrat.mois ? `${contrat.mois} mois` : null} />
            <Field
              label="Montant total"
              value={
                contrat.montant
                  ? `${Number(contrat.montant).toLocaleString("fr-FR")} €`
                  : null
              }
            />
            <Field
              label="Loyer mensuel"
              value={
                contrat.loyer
                  ? `${Number(contrat.loyer).toLocaleString("fr-FR")} €/mois`
                  : null
              }
            />
            <Field
              label="Date début"
              value={
                contrat.dateDebut
                  ? new Date(contrat.dateDebut).toLocaleDateString("fr-FR")
                  : null
              }
            />
            <Field
              label="Date fin"
              value={
                contrat.dateFin
                  ? new Date(contrat.dateFin).toLocaleDateString("fr-FR")
                  : null
              }
            />
          </Section>

          {/* Lien vente */}
          {contrat.vente && (
            <Section title="Vente source">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-gray-400" />
                <Link
                  to={`/ventes/${contrat.vente.id}`}
                  className="text-primary-600 hover:underline font-medium"
                >
                  {contrat.vente.numero}
                </Link>
              </div>
            </Section>
          )}
        </div>

        {/* Commentaires */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Commentaires</h2>

            {/* Formulaire ajout */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
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
                disabled={!newComment.trim() || addCommentMutation.isPending}
                className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>

            {/* Liste */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {contrat.commentaires?.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  Aucun commentaire
                </p>
              ) : (
                contrat.commentaires?.map((c: any) => (
                  <div
                    key={c.id}
                    className="bg-gray-50 rounded-lg p-3 group relative"
                  >
                    <p className="text-sm">{c.contenu}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400">
                        {c.auteur && `${c.auteur} · `}
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
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
