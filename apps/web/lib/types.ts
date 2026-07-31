export type OfferStatus =
  | "NEW"
  | "CONTACTED"
  | "REPLIED"
  | "WON"
  | "LOST"
  | "SKIP";

export type ItCategory =
  | "WEB"
  | "MOBILE"
  | "FULLSTACK"
  | "DEVOPS"
  | "CYBER"
  | "WORDPRESS"
  | "API_INTEGRATION"
  | "ECOMMERCE"
  | "DESIGN"
  | "DATA"
  | "OTHER"
  | "NOT_IT";

export type OfferType = "FREELANCE" | "CONTRACT" | "FULL_TIME" | "BUYER_REQUEST";

export type ContactType = "EMAIL" | "PHONE" | "WHATSAPP" | "PLATFORM_MESSAGE";

export type Platform =
  | "JOBMAROC"
  | "INDEED"
  | "LINKEDIN"
  | "FIVERR"
  | "AMAZON"
  | "REKRUTE"
  | "MARCHES_PUBLICS"
  | "OTHER";

export interface OfferContact {
  id: string;
  type: ContactType;
  value: string;
  source: "IN_POST" | "USER_ADDED";
  confidence: number;
}

export interface OutreachMessage {
  id: string;
  channel: "EMAIL" | "WHATSAPP";
  subject?: string | null;
  body: string;
  status: "DRAFT" | "SENT" | "FAILED";
  sentAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Offer {
  id: string;
  platform: Platform;
  externalId: string;
  url: string;
  title: string;
  descriptionRaw: string;
  descriptionClean?: string | null;
  companyName?: string | null;
  companyUrl?: string | null;
  publishedAt?: string | null;
  deadline?: string | null;
  budgetText?: string | null;
  location?: string | null;
  remote?: boolean | null;
  offerType: OfferType;
  itCategory: ItCategory;
  matchScore: number;
  matchReasons: string[];
  status: OfferStatus;
  contacts?: OfferContact[];
  messages?: OutreachMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
  dependencies: { database: "up" | "down" };
}

export type Role = "ADMIN" | "MEMBER";

export interface CurrentUser {
  id: string;
  email: string;
  role: Role;
}

export interface TeamMember {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface PlatformSourceDto {
  id: string;
  platform: Platform;
  name: string;
  type: string;
  baseUrl?: string | null;
  active: boolean;
  frequencyMinutes: number;
  maxPages: number;
  keywords: string[];
  lastRunAt?: string | null;
  lastRunStatus?: string | null;
  offerCount?: number;
}

export interface ServiceEntry {
  code: string;
  label: string;
  enabled: boolean;
}

export interface ScoringWeights {
  stack: number;
  freelance: number;
  freshness: number;
  location: number;
  budget: number;
}

export interface MessageTemplate {
  subject: string;
  body: string;
}

export interface TeamSettings {
  id: string;
  skills: string[];
  services: ServiceEntry[];
  weights: ScoringWeights;
  template: MessageTemplate;
  updatedAt: string;
}
