import api from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Campaign {
  id: string;
  title: string;
  description: string;
  target: number;
  raised: number;
  category: string;
  icon: string;
  color: string;
  lightColor: string;
  active: boolean;
  order: number;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
  bg: string;
  active: boolean;
  order: number;
}

export interface DocumentType {
  id: string;
  name: string;
  required: boolean;
  active: boolean;
  order: number;
}

export interface ServiceType {
  id: string;
  name: string;
  category: string | null;
  active: boolean;
  order: number;
}

export interface SiteContent {
  key: string;
  value: string;
  label: string | null;
  group: string | null;
}

export interface PublicCmsData {
  content: Record<string, string>;
  campaigns: Campaign[];
  programs: Program[];
  documentTypes: DocumentType[];
  serviceTypes: ServiceType[];
}

// ── Service ───────────────────────────────────────────────────────────────────

export const cmsService = {
  // Public
  getPublic: (): Promise<PublicCmsData> =>
    api.get("/cms/public").then((r) => r.data),

  // Site Content
  getContent: (): Promise<SiteContent[]> =>
    api.get("/cms/content").then((r) => r.data),
  updateContent: (key: string, value: string, label?: string, group?: string) =>
    api.patch(`/cms/content/${key}`, { value, label, group }).then((r) => r.data),

  // Campaigns
  getCampaigns: (admin = false): Promise<Campaign[]> =>
    api.get(`/cms/campaigns${admin ? "?admin=true" : ""}`).then((r) => r.data),
  createCampaign: (data: Omit<Campaign, "id">): Promise<Campaign> =>
    api.post("/cms/campaigns", data).then((r) => r.data),
  updateCampaign: (id: string, data: Partial<Campaign>): Promise<Campaign> =>
    api.patch(`/cms/campaigns/${id}`, data).then((r) => r.data),
  deleteCampaign: (id: string) =>
    api.delete(`/cms/campaigns/${id}`).then((r) => r.data),

  // Programs
  getPrograms: (admin = false): Promise<Program[]> =>
    api.get(`/cms/programs${admin ? "?admin=true" : ""}`).then((r) => r.data),
  createProgram: (data: Omit<Program, "id">): Promise<Program> =>
    api.post("/cms/programs", data).then((r) => r.data),
  updateProgram: (id: string, data: Partial<Program>): Promise<Program> =>
    api.patch(`/cms/programs/${id}`, data).then((r) => r.data),
  deleteProgram: (id: string) =>
    api.delete(`/cms/programs/${id}`).then((r) => r.data),

  // Document Types
  getDocumentTypes: (admin = false): Promise<DocumentType[]> =>
    api.get(`/cms/document-types${admin ? "?admin=true" : ""}`).then((r) => r.data),
  createDocumentType: (data: Omit<DocumentType, "id">): Promise<DocumentType> =>
    api.post("/cms/document-types", data).then((r) => r.data),
  updateDocumentType: (id: string, data: Partial<DocumentType>): Promise<DocumentType> =>
    api.patch(`/cms/document-types/${id}`, data).then((r) => r.data),
  deleteDocumentType: (id: string) =>
    api.delete(`/cms/document-types/${id}`).then((r) => r.data),

  // Service Types
  getServiceTypes: (admin = false): Promise<ServiceType[]> =>
    api.get(`/cms/service-types${admin ? "?admin=true" : ""}`).then((r) => r.data),
  createServiceType: (data: Omit<ServiceType, "id">): Promise<ServiceType> =>
    api.post("/cms/service-types", data).then((r) => r.data),
  updateServiceType: (id: string, data: Partial<ServiceType>): Promise<ServiceType> =>
    api.patch(`/cms/service-types/${id}`, data).then((r) => r.data),
  deleteServiceType: (id: string) =>
    api.delete(`/cms/service-types/${id}`).then((r) => r.data),
};
