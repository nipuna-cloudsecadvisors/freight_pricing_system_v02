export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sbuId?: string;
}

export type UserRole = 'ADMIN' | 'SBU_HEAD' | 'SALES' | 'CSE' | 'PRICING' | 'MGMT';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  approver?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Port {
  id: string;
  unlocode: string;
  name: string;
  country: string;
}

export interface TradeLane {
  id: string;
  region: string;
  name: string;
  code: string;
}

export interface ShippingLine {
  id: string;
  name: string;
  code: string;
}

export interface EquipmentType {
  id: string;
  name: string;
  isReefer: boolean;
  isFlatRackOpenTop: boolean;
}

export interface PredefinedRate {
  id: string;
  service: string;
  validFrom: string;
  validTo: string;
  status: 'ACTIVE' | 'EXPIRED';
  notes?: string;
  chargesJson?: any;
  validityStatus: 'active' | 'expiring' | 'expired';
  hasUpdateRequests: boolean;
  tradeLane: TradeLane;
  pol: Port;
  pod: Port;
  equipmentType: EquipmentType;
  updateRequests: Array<{
    id: string;
    reason?: string;
    createdAt: string;
    requester: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export interface RateRequest {
  id: string;
  refNo: string;
  mode: 'SEA' | 'AIR';
  type: 'FCL' | 'LCL';
  doorOrCy: 'DOOR' | 'CY';
  usZip?: string;
  reeferTemp?: string;
  palletCount?: number;
  palletDims?: string;
  hsCode: string;
  weightTons: number;
  incoterm: string;
  marketRate?: number;
  specialInstructions?: string;
  cargoReadyDate: string;
  vesselRequired: boolean;
  detentionFreeTime: 'SEVEN' | 'FOURTEEN' | 'TWENTYONE' | 'OTHER';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  processedPercentage?: number;
  pol: Port;
  pod: Port;
  preferredLine?: ShippingLine;
  equipmentType: EquipmentType;
  salesperson: {
    id: string;
    name: string;
    email: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
  };
  responses: RateRequestResponse[];
  lineQuotes: LineQuote[];
}

export interface RateRequestResponse {
  id: string;
  lineNo: number;
  vesselName?: string;
  eta?: string;
  etd?: string;
  fclCutoff?: string;
  docCutoff?: string;
  validTo: string;
  chargesJson: any;
  createdAt: string;
  requestedLine: ShippingLine;
  requestedEquipType: EquipmentType;
  responder: {
    id: string;
    name: string;
  };
}

export interface LineQuote {
  id: string;
  termsJson: any;
  validTo: string;
  selected: boolean;
  createdAt: string;
  line: ShippingLine;
  quoter: {
    id: string;
    name: string;
  };
}

export interface BookingRequest {
  id: string;
  rateSource: string;
  linkId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  raisedBy: {
    id: string;
    name: string;
    email: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
  };
  predefinedRate?: PredefinedRate;
  rateRequest?: RateRequest;
  lineQuote?: LineQuote & {
    rateRequest: RateRequest;
  };
  roDocuments: RoDocument[];
  jobs: Job[];
}

export interface RoDocument {
  id: string;
  number: string;
  fileUrl?: string;
  receivedAt: string;
  createdAt: string;
}

export interface Job {
  id: string;
  erpJobNo: string;
  openedAt: string;
  createdAt: string;
  openedBy: {
    id: string;
    name: string;
  };
  completions: JobCompletion[];
}

export interface JobCompletion {
  id: string;
  detailsJson: any;
  completedAt: string;
  createdAt: string;
  cse: {
    id: string;
    name: string;
  };
}

export interface Itinerary {
  id: string;
  type: 'SP' | 'CSE';
  weekStart: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  approveNote?: string;
  submittedAt?: string;
  decidedAt?: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  approver?: {
    id: string;
    name: string;
    email: string;
  };
  items: ItineraryItem[];
}

export interface ItineraryItem {
  id: string;
  date: string;
  purpose: string;
  plannedTime: string;
  location: string;
  notes?: string;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
  };
  lead?: {
    id: string;
    companyName: string;
  };
}

export interface SalesActivity {
  id: string;
  type: 'VISIT' | 'CALL' | 'MEETING';
  date: string;
  notes?: string;
  outcome?: string;
  nextActionDate?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  customer?: {
    id: string;
    name: string;
  };
  lead?: {
    id: string;
    companyName: string;
  };
}

export interface Lead {
  id: string;
  companyName: string;
  contact: string;
  stage: 'PROSPECT' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
  source?: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  salesActivities?: SalesActivity[];
}

export interface Notification {
  id: string;
  channel: 'SYSTEM' | 'EMAIL' | 'SMS';
  subject: string;
  body: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  meta?: any;
  createdAt: string;
  sentAt?: string;
}