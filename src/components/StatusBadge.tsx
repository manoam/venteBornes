import { clsx } from "clsx";

const statutLabels: Record<string, string> = {
  EN_ATTENTE: "En attente",
  EN_PREPA: "En préparation",
  PRET_EXP: "Prête à expédier",
  EXPEDIE: "Expédiée",
  RECEPTIONNE: "Réceptionné",
};

const statutColors: Record<string, string> = {
  EN_ATTENTE: "bg-yellow-100 text-yellow-800",
  EN_PREPA: "bg-blue-100 text-blue-800",
  PRET_EXP: "bg-purple-100 text-purple-800",
  EXPEDIE: "bg-orange-100 text-orange-800",
  RECEPTIONNE: "bg-green-100 text-green-800",
};

const facturationLabels: Record<string, string> = {
  ATTENTE_FACTURATION: "Attente facturation",
  FACTURE_ENVOYEE: "Facture envoyée",
  ACCOMPTE_ATTENTE: "Attente acompte",
  ACCOMPTE_REGLE: "Acompte réglé",
  REGLEMENT_OK: "Règlement OK",
};

const facturationColors: Record<string, string> = {
  ATTENTE_FACTURATION: "bg-gray-100 text-gray-800",
  FACTURE_ENVOYEE: "bg-blue-100 text-blue-800",
  ACCOMPTE_ATTENTE: "bg-yellow-100 text-yellow-800",
  ACCOMPTE_REGLE: "bg-orange-100 text-orange-800",
  REGLEMENT_OK: "bg-green-100 text-green-800",
};

interface StatusBadgeProps {
  type: "statut" | "facturation";
  value: string;
}

export default function StatusBadge({ type, value }: StatusBadgeProps) {
  const labels = type === "statut" ? statutLabels : facturationLabels;
  const colors = type === "statut" ? statutColors : facturationColors;

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        colors[value] ?? "bg-gray-100 text-gray-800"
      )}
    >
      {labels[value] ?? value}
    </span>
  );
}
