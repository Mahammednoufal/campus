// Type definitions for Smart Campus Care

export type UserRole = "principal" | "complaint_team" | "maintenance_staff";

export type ComplaintStatus =
  | "submitted"
  | "assigned"
  | "in_progress"
  | "on_hold"
  | "resolved"
  | "verified"
  | "closed"
  | "rejected"
  | "reopened";

export type ComplaintPriority = "critical" | "high" | "normal" | "low";

export type ComplaintCategory =
  | "electrical"
  | "plumbing"
  | "furniture"
  | "cleaning"
  | "it_equipment"
  | "infrastructure"
  | "other";

export type LocationType = "building" | "floor" | "room" | "area";

export type AssetType =
  | "fan"
  | "light"
  | "ac"
  | "projector"
  | "computer"
  | "desk"
  | "chair"
  | "bench"
  | "tap"
  | "pipe"
  | "door"
  | "window"
  | "whiteboard"
  | "other";

export type MaintenanceSpecialty =
  | "electrical"
  | "plumbing"
  | "furniture_carpentry"
  | "housekeeping"
  | "it_support"
  | "general_maintenance";

export type AttachmentType = "complaint_photo" | "repair_evidence" | "other";

export type UpdateType =
  | "submitted"
  | "assigned"
  | "reassigned"
  | "status_change"
  | "priority_change"
  | "comment"
  | "deadline_change"
  | "escalated"
  | "repair_note"
  | "repair_evidence"
  | "verification_requested"
  | "verified"
  | "reopened"
  | "closed"
  | "rejected"
  | "on_hold"
  | "safety_alert"
  | "delay_reason";

export type NotificationType =
  | "new_complaint"
  | "assignment"
  | "status_update"
  | "deadline_warning"
  | "overdue"
  | "critical_safety"
  | "resolved"
  | "verification_needed"
  | "reopened"
  | "escalation"
  | "recurring_issue";

// Database row types
export interface Institution {
  id: string;
  name: string;
  code: string;
  address: string | null;
  is_active: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  institution_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  institution_id: string;
  parent_id: string | null;
  name: string;
  type: LocationType;
  description: string | null;
  public_id: string;
  is_active: boolean;
  qr_enabled: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  parent?: Location | null;
  children?: Location[];
  assets?: Asset[];
}

export interface Asset {
  id: string;
  institution_id: string;
  location_id: string;
  name: string;
  type: AssetType;
  identifier: string | null;
  public_id: string;
  is_active: boolean;
  installed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  location?: Location;
}

export interface MaintenanceTeam {
  id: string;
  institution_id: string;
  name: string;
  specialty: MaintenanceSpecialty;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  staff?: MaintenanceStaff[];
}

export interface MaintenanceStaff {
  id: string;
  institution_id: string;
  team_id: string | null;
  name: string;
  phone: string | null;
  specialty: MaintenanceSpecialty;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  team?: MaintenanceTeam;
}

export interface SlaPolicy {
  id: string;
  institution_id: string;
  priority: ComplaintPriority;
  response_time_minutes: number;
  resolution_time_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: string;
  institution_id: string;
  ticket_id: string;
  location_id: string;
  asset_id: string | null;
  category: ComplaintCategory;
  title: string;
  description: string;
  reporter_name: string | null;
  reporter_contact: string | null;
  tracking_token: string;
  tracking_secret: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  is_critical_safety: boolean;
  is_overdue: boolean;
  is_escalated: boolean;
  assigned_team_id: string | null;
  assigned_staff_id: string | null;
  assigned_at: string | null;
  assigned_by: string | null;
  submitted_at: string;
  response_deadline: string | null;
  resolution_deadline: string | null;
  first_responded_at: string | null;
  resolved_at: string | null;
  verified_at: string | null;
  closed_at: string | null;
  resolution_notes: string | null;
  rejection_reason: string | null;
  reopen_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  location?: Location;
  asset?: Asset;
  assigned_team?: MaintenanceTeam;
  assigned_staff?: MaintenanceStaff;
  attachments?: ComplaintAttachment[];
  updates?: ComplaintUpdate[];
}

export interface ComplaintAttachment {
  id: string;
  complaint_id: string;
  file_url: string;
  file_name: string;
  file_size: number | null;
  file_type: string | null;
  attachment_type: AttachmentType;
  uploaded_by: string | null;
  created_at: string;
}

export interface ComplaintUpdate {
  id: string;
  complaint_id: string;
  update_type: UpdateType;
  description: string;
  old_value: string | null;
  new_value: string | null;
  performed_by: string | null;
  performer_name: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Notification {
  id: string;
  institution_id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  complaint_id: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  institution_id: string | null;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

// Form types
export interface ComplaintFormData {
  category: ComplaintCategory;
  title: string;
  description: string;
  reporter_name?: string;
  reporter_contact?: string;
  location_id: string;
  asset_id?: string;
  photo?: File;
}

// Dashboard summary types
export interface DashboardSummary {
  totalComplaints: number;
  openComplaints: number;
  resolvedComplaints: number;
  overdueComplaints: number;
  criticalIssues: number;
  slaCompliance: number;
  newComplaints: number;
  unassignedComplaints: number;
  assignedTasks: number;
  inProgressTasks: number;
  awaitingVerification: number;
}

// Category display info
export const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  electrical: "Electrical",
  plumbing: "Plumbing",
  furniture: "Furniture",
  cleaning: "Cleaning & Washrooms",
  it_equipment: "IT Equipment",
  infrastructure: "Infrastructure",
  other: "Other",
};

export const PRIORITY_LABELS: Record<ComplaintPriority, string> = {
  critical: "Critical",
  high: "High",
  normal: "Normal",
  low: "Low",
};

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  submitted: "Submitted",
  assigned: "Assigned",
  in_progress: "In Progress",
  on_hold: "On Hold",
  resolved: "Resolved",
  verified: "Verified",
  closed: "Closed",
  rejected: "Rejected",
  reopened: "Reopened",
};

export const SPECIALTY_LABELS: Record<MaintenanceSpecialty, string> = {
  electrical: "Electrical",
  plumbing: "Plumbing",
  furniture_carpentry: "Furniture & Carpentry",
  housekeeping: "Housekeeping",
  it_support: "IT Support",
  general_maintenance: "General Maintenance",
};

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  fan: "Fan",
  light: "Light",
  ac: "AC",
  projector: "Projector",
  computer: "Computer",
  desk: "Desk",
  chair: "Chair",
  bench: "Bench",
  tap: "Tap",
  pipe: "Pipe",
  door: "Door",
  window: "Window",
  whiteboard: "Whiteboard",
  other: "Other",
};
