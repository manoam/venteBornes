import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit, Truck, CreditCard } from "lucide-react";
import { ventesApi } from "../lib/api";
import StatusBadge from "../components/StatusBadge";

export default function VenteDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: vente, isLoading } = useQuery({
    queryKey: ["vente", id],
    queryFn: () => ventesApi.get(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Chargement...</div>;
  }

  if (!vente) {
    return <div className="text-center py-12 text-gray-500">Vente non trouvée</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/ventes"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{vente.numero}</h1>
            <p className="text-sm text-gray-500">
              Créée le{" "}
              {new Date(vente.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <StatusBadge type="statut" value={vente.venteStatut} />
          <StatusBadge type="facturation" value={vente.etatFacturation} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client */}
        <Section title="Client" icon={<Edit size={18} />}>
          <Field label="Nom" value={vente.client?.nom ?? vente.clientNom} />
          <Field label="Prénom" value={vente.client?.prenom ?? vente.clientPrenom} />
          <Field label="Email" value={vente.client?.email ?? vente.clientEmail} />
          <Field label="Téléphone" value={vente.clientTelephone} />
          <Field
            label="Adresse"
            value={[vente.clientAdresse, vente.clientCp, vente.clientVille]
              .filter(Boolean)
              .join(", ")}
          />
        </Section>

        {/* Équipement */}
        <Section title="Équipement" icon={<Truck size={18} />}>
          <Field label="Gamme" value={vente.gammeBorne?.nom} />
          <Field label="Modèle" value={vente.modelBorne?.nom} />
          <Field label="Couleur" value={vente.couleur?.nom} />
          <Field label="Borne" value={vente.borne?.numero} />
          <Field label="Logiciel" value={vente.logiciel} />
          {vente.isMarqueBlanche && <Tag>Marque blanche</Tag>}
          {vente.isCustomGravure && <Tag>Gravure personnalisée</Tag>}
          {vente.isValiseTransport && <Tag>Valise transport</Tag>}
          {vente.isHousseProtection && <Tag>Housse protection</Tag>}
        </Section>

        {/* Facturation */}
        <Section title="Facturation" icon={<CreditCard size={18} />}>
          <Field
            label="Montant HT"
            value={
              vente.facturationMontantHt
                ? `${Number(vente.facturationMontantHt).toLocaleString("fr-FR")} €`
                : undefined
            }
          />
          <Field label="Entité juridique" value={vente.facturationEntityJurid} />
          <Field label="Type achat" value={vente.facturationAchatType} />
          <Field
            label="CP / Ville"
            value={[vente.facturationCp, vente.facturationVille]
              .filter(Boolean)
              .join(" ")}
          />
          <Field label="État" value={undefined}>
            <StatusBadge type="facturation" value={vente.etatFacturation} />
          </Field>
        </Section>

        {/* Livraison */}
        <Section title="Livraison" icon={<Truck size={18} />}>
          <Field
            label="Adresse"
            value={[vente.livraisonAdresse, vente.livraisonCp, vente.livraisonVille]
              .filter(Boolean)
              .join(", ")}
          />
          <Field label="Pays" value={vente.livraisonPays?.nom} />
          <Field
            label="Date"
            value={
              vente.livraisonDate
                ? new Date(vente.livraisonDate).toLocaleDateString("fr-FR")
                : undefined
            }
          />
          <Field label="Contact" value={vente.livraisonContactFullname} />
          <Field label="Email contact" value={vente.livraisonContactEmail} />
          <Field label="Infos supplémentaires" value={vente.livraisonInfosSup} />
        </Section>

        {/* Accessoires */}
        {vente.accessoires?.length > 0 && (
          <Section title="Accessoires">
            <div className="space-y-2">
              {vente.accessoires.map((a: any) => (
                <div
                  key={a.id}
                  className="flex justify-between items-center py-1"
                >
                  <span>{a.accessoire?.nom}</span>
                  <span className="text-sm text-gray-500">x{a.qty}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Consommables */}
        {vente.consommables?.length > 0 && (
          <Section title="Consommables">
            <div className="space-y-2">
              {vente.consommables.map((c: any) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center py-1"
                >
                  <span>
                    {c.typeConsommable?.nom} — {c.sousTypeConsommable?.nom}
                  </span>
                  <span className="text-sm text-gray-500">x{c.qty}</span>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
        {icon}
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: string | null;
  children?: React.ReactNode;
}) {
  if (!value && !children) return null;
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      {children ?? <span className="text-sm font-medium">{value}</span>}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded mr-2 mt-1">
      {children}
    </span>
  );
}
