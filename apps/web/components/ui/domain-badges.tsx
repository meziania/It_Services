import { Mail, Phone, MessageCircle } from "lucide-react";
import { Badge, type BadgeColor } from "./badge";
import type { ItCategory, OfferContact, OfferStatus, OfferType, Platform } from "@/lib/types";

const PLATFORM_META: Record<Platform, { label: string; color: BadgeColor }> = {
  REKRUTE: { label: "ReKrute", color: "blue" },
  MARCHES_PUBLICS: { label: "Marchés Publics", color: "teal" },
  KHAMSAT: { label: "Khamsat", color: "emerald" },
  MOSTAQL: { label: "Mostaql", color: "cyan" },
  JOBMAROC: { label: "JobMaroc", color: "cyan" },
  INDEED: { label: "Indeed", color: "indigo" },
  LINKEDIN: { label: "LinkedIn", color: "violet" },
  FIVERR: { label: "Fiverr", color: "emerald" },
  AMAZON: { label: "Amazon", color: "amber" },
  OTHER: { label: "Autre", color: "slate" },
};

export function PlatformBadge({ platform }: { platform: Platform }) {
  const meta = PLATFORM_META[platform] ?? PLATFORM_META.OTHER;
  return <Badge color={meta.color}>{meta.label}</Badge>;
}

const CATEGORY_META: Record<ItCategory, { label: string; color: BadgeColor }> = {
  WEB: { label: "Web", color: "blue" },
  MOBILE: { label: "Mobile", color: "violet" },
  FULLSTACK: { label: "Fullstack", color: "cyan" },
  DEVOPS: { label: "DevOps", color: "amber" },
  CYBER: { label: "Cyber", color: "red" },
  WORDPRESS: { label: "WordPress", color: "indigo" },
  API_INTEGRATION: { label: "API", color: "cyan" },
  ECOMMERCE: { label: "E-commerce", color: "pink" },
  DESIGN: { label: "Design", color: "pink" },
  DATA: { label: "Data", color: "emerald" },
  OTHER: { label: "Autre", color: "slate" },
  NOT_IT: { label: "Hors IT", color: "red" },
};

export function CategoryBadge({ category }: { category: ItCategory }) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META.OTHER;
  return <Badge color={meta.color}>{meta.label}</Badge>;
}

const STATUS_META: Record<OfferStatus, { label: string; color: BadgeColor }> = {
  NEW: { label: "Nouveau", color: "blue" },
  CONTACTED: { label: "Contacté", color: "amber" },
  REPLIED: { label: "Répondu", color: "violet" },
  WON: { label: "Gagné", color: "emerald" },
  LOST: { label: "Perdu", color: "red" },
  SKIP: { label: "Ignoré", color: "slate" },
};

export function StatusBadge({ status }: { status: OfferStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.NEW;
  return <Badge color={meta.color}>{meta.label}</Badge>;
}

export const STATUS_ORDER: OfferStatus[] = ["NEW", "CONTACTED", "REPLIED", "WON", "LOST", "SKIP"];
export { STATUS_META };

const OFFER_TYPE_LABEL: Record<OfferType, string> = {
  FREELANCE: "Freelance",
  CONTRACT: "CDD",
  FULL_TIME: "CDI",
  BUYER_REQUEST: "Demande",
};

export function OfferTypeBadge({ offerType }: { offerType: OfferType }) {
  return <Badge color="slate">{OFFER_TYPE_LABEL[offerType] ?? offerType}</Badge>;
}

/** Docs2/16 "Trouve les contacts publics" — quick glance icons for the list view. */
export function ContactIndicator({ contacts }: { contacts?: OfferContact[] | null }) {
  if (!contacts || contacts.length === 0) {
    return <span className="text-xs text-slate-600">—</span>;
  }

  const hasEmail = contacts.some((c) => c.type === "EMAIL");
  const hasWhatsapp = contacts.some((c) => c.type === "WHATSAPP");
  const hasPhone = contacts.some((c) => c.type === "PHONE");

  return (
    <div className="flex items-center gap-1.5 text-emerald-400" title={`${contacts.length} contact(s) détecté(s)`}>
      {hasEmail ? <Mail size={14} /> : null}
      {hasWhatsapp ? <MessageCircle size={14} /> : null}
      {hasPhone ? <Phone size={14} /> : null}
    </div>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const color: BadgeColor = score >= 70 ? "emerald" : score >= 40 ? "amber" : "red";
  return (
    <Badge color={color} className="font-semibold">
      {score}
    </Badge>
  );
}
