export const APP_ROLES = [
  "ADMIN",
  "CEO",
  "MANAGER",
  "CASE_WORKER",
  "DATA_ENTRY",
  "EXECUTION_OFFICER",
  "CALL_CENTER",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface FamilyMemberRecord {
  id: string;
  name: string;
  relation: string;
  age?: string | null;
  education?: string | null;
}

export interface CaseIntakeFamilyMember {
  id: string;
  name: string;
  relation: string;
  classification?: string;
  nationalId?: string;
  age?: string;
  gender?: string;
  mobile?: string;
  education?: string;
  educationType?: string;
  educationStage?: string;
  schoolYear?: string;
  job?: string;
  monthlyIncome?: string;
}

export interface CaseIntakeHousingRoom {
  id: string;
  name: string;
  condition?: string;
}

export interface CaseIntakePossessionItem {
  id: string;
  name: string;
  selected?: boolean;
  type?: string;
  value?: string;
  notes?: string;
}

export interface CaseIntakeSupportItem {
  id: string;
  category: string;
  name: string;
  selected: boolean;
  notes?: string;
  cost?: string;
}

export interface CaseIntakeFormData {
  person: {
    fullName: string;
    nationalId: string;
    religion: string;
    birthDate: string;
    age: string;
    gender: string;
    mobile: string;
    job: string;
    monthlyIncome: string;
    educationState: string;
    educationType: string;
    educationStage: string;
    schoolYear: string;
    educationNotes: string;
    expensesExempted: boolean;
    center: string;
    village: string;
    region: string;
    association: string;
    detailedAddress: string;
    attachments: string[];
    tamweenSupport: boolean;
    tamweenBeneficiaries: string;
  };
  family: {
    linkedFamilyId: string;
    members: CaseIntakeFamilyMember[];
    dataComplete: boolean;
  };
  housing: {
    description: string;
    residencyType: string;
    roof: string[];
    floor: string[];
    entrance: string[];
    walls: string[];
    bathroomType: string;
    bathroomState: string;
    electricity: string;
    water: string;
    waterPump: string;
    cookware: string;
    tv: string;
    fridge: string;
    washingMachine: string;
    oven: string;
    computer: string;
    internet: string;
    rentAmount: string;
    transport: string[];
    rooms: CaseIntakeHousingRoom[];
    dataComplete: boolean;
  };
  possessions: {
    hasPossessions: string;
    items: CaseIntakePossessionItem[];
    dataComplete: boolean;
  };
  finance: {
    incomes: Record<string, string>;
    expenses: Record<string, string>;
    netMonthlyIncome: string;
    dataComplete: boolean;
  };
  classification: {
    tags: string[];
    degree: string;
  };
  support: {
    items: CaseIntakeSupportItem[];
    specialistName: string;
    specialistNotes: string;
    specialistOpinion: string;
    managerDecision: string;
    managerComments: string;
    disabilitySupportType: string;
    disabilitySupportDescription: string;
    disabilitySupportCost: string;
  };
}

export interface CaseHistoryRecord {
  id: string;
  action: string;
  reason?: string | null;
  fromLifecycleStatus?: string | null;
  toLifecycleStatus: string;
  fromDecisionStatus?: string | null;
  toDecisionStatus: string;
  performedAt: string;
  performedBy?: {
    id: string;
    name: string;
    role: string;
  } | null;
}

export interface FamilyRecord {
  id: string;
  headName: string;
  nationalId?: string | null;
  phone?: string | null;
  socialStatus?: string | null;
  job?: string | null;
  income?: string | null;
  city?: string | null;
  village?: string | null;
  addressDetails?: string | null;
  address?: string | null;
  membersCount: number;
  status: string;
  lastVisit: string;
  createdAt?: string;
  updatedAt?: string;
  education?: string | null;
  familyMembers?: FamilyMemberRecord[];
  cases?: CaseRecord[];
}

export interface OperationRecord {
  id: string;
  name: string;
  type: string;
  date: string;
  target: number;
  achieved: number;
  status: string;
  progress: number;
  volunteers: number;
  budget?: string | null;
  location?: string | null;
  cases?: CaseRecord[];
}

export interface CaseRecord {
  id: string;
  applicantName: string;
  nationalId?: string | null;
  caseType: string;
  status?: string;
  lifecycleStatus: string;
  completenessStatus: string;
  decisionStatus: string;
  priority: string;
  location: string;
  description?: string | null;
  formData?: CaseIntakeFormData | null;
  familyId?: string | null;
  operationId?: string | null;
  requiresCommitteeReview?: boolean;
  lastActionAt?: string;
  createdAt: string;
  updatedAt?: string;
  family?: FamilyRecord | null;
  operation?: OperationRecord | null;
  assignedTo?: AppUser | null;
  history?: CaseHistoryRecord[];
}

export interface NewsRecord {
  id: string;
  title: string;
  content: string;
  category: string;
  image?: string | null;
  date: string;
  published: boolean;
}

export interface PartnerRecord {
  id: string;
  name: string;
  type: string;
  contact?: string | null;
  email?: string | null;
  status: string;
  image?: string | null;
}

export interface LocationRecord {
  id: string;
  name: string;
  type: string;
  region: string;
  status: string;
}

export interface SearchResults {
  cases: CaseRecord[];
  families: FamilyRecord[];
}

export interface RequestAidPayload {
  applicantName: string;
  nationalId?: string;
  phone: string;
  city: string;
  village?: string;
  aidType: string;
  description: string;
  addressDetails?: string;
}

export interface RequestAidResponse {
  requestId: string;
  fullRequestId: string;
  lifecycleStatus: string;
  message: string;
}

export interface VerifyRequestResponse {
  id: string;
  applicantName: string;
  caseType: string;
  lifecycleStatus: string;
  decisionStatus: string;
  createdAt: string;
  phone?: string | null;
}

export interface VerifyMemberResponse {
  headName: string;
  nationalId?: string | null;
  status: string;
  city: string;
  phone?: string | null;
  recentCases: Array<{
    id: string;
    caseType: string;
    lifecycleStatus: string;
  }>;
}

export interface ContactMessagePayload {
  name: string;
  phone: string;
  email?: string;
  topic: string;
  message: string;
}

export interface VolunteerApplicationPayload {
  name: string;
  phone: string;
  age?: number;
  preferredArea: string;
  notes?: string;
}

export interface SubmissionResponse {
  message: string;
  submittedAt: string;
}
