import fs from "fs";
import path from "path";
import {
  Complaint,
  Location,
  Asset,
  MaintenanceTeam,
  MaintenanceStaff,
  SlaPolicy,
  Notification,
  DashboardSummary,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
} from "../types";
import {
  INITIAL_LOCATIONS,
  INITIAL_ASSETS,
  INITIAL_TEAMS,
  INITIAL_STAFF,
  INITIAL_SLA,
  INITIAL_INSTITUTION,
} from "./mock-data";

const DB_FILE = path.join(process.cwd(), "src", "lib", "data", "db.json");

export interface DatabaseSchema {
  institution: typeof INITIAL_INSTITUTION;
  locations: Location[];
  assets: Asset[];
  teams: MaintenanceTeam[];
  staff: MaintenanceStaff[];
  slaPolicies: SlaPolicy[];
  complaints: Complaint[];
  notifications: Notification[];
  nextTicketNumber: number;
}

function getInitialDB(): DatabaseSchema {
  return {
    institution: INITIAL_INSTITUTION,
    locations: INITIAL_LOCATIONS,
    assets: INITIAL_ASSETS,
    teams: INITIAL_TEAMS,
    staff: INITIAL_STAFF,
    slaPolicies: INITIAL_SLA,
    // Start with empty complaints so ONLY real complaints submitted by the student appear!
    complaints: [],
    notifications: [],
    nextTicketNumber: 1001,
  };
}

export function readDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDB();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading db.json:", err);
    return getInitialDB();
  }
}

export function writeDB(data: DatabaseSchema): void {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error("Error writing db.json:", err);
  }
}

import { evaluateCriticalSafety } from "../utils";
export { evaluateCriticalSafety };

export const PersistentStore = {
  getAll() {
    const db = readDB();
    const now = Date.now();

    // Map and re-evaluate overdue status live
    const complaints = db.complaints.map((c) => {
      const isStillOpen = !["resolved", "verified", "closed", "rejected"].includes(c.status);
      const isOverdue =
        isStillOpen && c.resolution_deadline ? new Date(c.resolution_deadline).getTime() < now : false;

      return {
        ...c,
        is_overdue: isOverdue,
        location: db.locations.find((l) => l.id === c.location_id),
        asset: db.assets.find((a) => a.id === c.asset_id),
        assigned_team: db.teams.find((t) => t.id === c.assigned_team_id),
        assigned_staff: db.staff.find((s) => s.id === c.assigned_staff_id),
      };
    });

    const locations = db.locations.map((loc) => ({
      ...loc,
      parent: db.locations.find((p) => p.id === loc.parent_id) || null,
      children: db.locations.filter((c) => c.parent_id === loc.id),
      assets: db.assets.filter((a) => a.location_id === loc.id),
    }));

    const assets = db.assets.map((asset) => ({
      ...asset,
      location: db.locations.find((l) => l.id === asset.location_id),
    }));

    const teams = db.teams.map((t) => ({
      ...t,
      staff: db.staff.filter((s) => s.team_id === t.id),
    }));

    const staff = db.staff.map((s) => ({
      ...s,
      team: db.teams.find((t) => t.id === s.team_id),
    }));

    return {
      institution: db.institution,
      locations,
      assets,
      teams,
      staff,
      slaPolicies: db.slaPolicies,
      complaints,
      notifications: db.notifications,
      summary: this.computeSummary(complaints),
    };
  },

  createComplaint(data: {
    category: ComplaintCategory;
    title: string;
    description: string;
    location_id: string;
    asset_id?: string | null;
    reporter_name?: string | null;
    reporter_contact?: string | null;
    photo_url?: string | null;
  }) {
    const db = readDB();
    const ticketId = `SCC-${db.nextTicketNumber++}`;
    const token = `track_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    const secret = `scc_sec_${Math.random().toString(36).substring(2, 10)}`;

    const isCriticalSafety = evaluateCriticalSafety(
      data.category,
      data.title,
      data.description
    );
    const priority: ComplaintPriority = isCriticalSafety ? "critical" : "normal";

    const sla = db.slaPolicies.find((s) => s.priority === priority) || {
      response_time_minutes: isCriticalSafety ? 30 : 120,
      resolution_time_minutes: isCriticalSafety ? 240 : 1440,
    };

    const submittedAt = new Date();
    const responseDeadline = new Date(
      submittedAt.getTime() + sla.response_time_minutes * 60000
    );
    const resolutionDeadline = new Date(
      submittedAt.getTime() + sla.resolution_time_minutes * 60000
    );

    const attachments = data.photo_url
      ? [
          {
            id: `att-${Date.now()}`,
            complaint_id: `cmp-${Date.now()}`,
            file_url: data.photo_url,
            file_name: "complaint-photo.jpg",
            file_size: 102400,
            file_type: "image/jpeg",
            attachment_type: "complaint_photo" as const,
            uploaded_by: null,
            created_at: submittedAt.toISOString(),
          },
        ]
      : [];

    const newComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      institution_id: "inst-001",
      ticket_id: ticketId,
      location_id: data.location_id,
      asset_id: data.asset_id || null,
      category: data.category,
      title: data.title,
      description: data.description,
      reporter_name: data.reporter_name || "Campus Community Member",
      reporter_contact: data.reporter_contact || null,
      tracking_token: token,
      tracking_secret: secret,
      status: "submitted",
      priority: priority,
      is_critical_safety: isCriticalSafety,
      is_overdue: false,
      is_escalated: isCriticalSafety,
      assigned_team_id: null,
      assigned_staff_id: null,
      assigned_at: null,
      assigned_by: null,
      submitted_at: submittedAt.toISOString(),
      response_deadline: responseDeadline.toISOString(),
      resolution_deadline: resolutionDeadline.toISOString(),
      first_responded_at: null,
      resolved_at: null,
      verified_at: null,
      closed_at: null,
      resolution_notes: null,
      rejection_reason: null,
      reopen_count: 0,
      created_at: submittedAt.toISOString(),
      updated_at: submittedAt.toISOString(),
      attachments: attachments,
      updates: [
        {
          id: `upd-${Date.now()}`,
          complaint_id: `cmp-${Date.now()}`,
          update_type: "submitted",
          description: `Complaint submitted via QR code (${data.category})`,
          old_value: null,
          new_value: "submitted",
          performed_by: null,
          performer_name: data.reporter_name || "Campus Reporter",
          metadata: { is_critical: isCriticalSafety },
          created_at: submittedAt.toISOString(),
        },
      ],
    };

    db.complaints.unshift(newComplaint);

    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      institution_id: "inst-001",
      user_id: "user-complaint-team",
      title: isCriticalSafety ? "CRITICAL SAFETY HAZARD REPORTED" : "New Complaint Submitted",
      message: `${ticketId}: ${data.title}`,
      type: isCriticalSafety ? "critical_safety" : "new_complaint",
      complaint_id: newComplaint.id,
      link: `/complaint-team/complaints/${newComplaint.id}`,
      is_read: false,
      created_at: submittedAt.toISOString(),
    });

    if (isCriticalSafety) {
      db.notifications.unshift({
        id: `notif-${Date.now()}-prin`,
        institution_id: "inst-001",
        user_id: "user-principal",
        title: "CRITICAL SAFETY ALERT ESCALATED",
        message: `${ticketId} requires urgent intervention: ${data.title}`,
        type: "critical_safety",
        complaint_id: newComplaint.id,
        link: `/principal/critical-issues`,
        is_read: false,
        created_at: submittedAt.toISOString(),
      });
    }

    writeDB(db);
    return { complaint: newComplaint, tracking_secret: secret };
  },

  updateComplaint(
    complaintId: string,
    action: {
      type: any;
      performerName: string;
      description: string;
      status?: ComplaintStatus;
      priority?: ComplaintPriority;
      assignedTeamId?: string | null;
      assignedStaffId?: string | null;
      resolutionNotes?: string;
      evidenceUrl?: string;
      delayReason?: string;
      rejectionReason?: string;
    }
  ) {
    const db = readDB();
    const idx = db.complaints.findIndex(
      (c) => c.id === complaintId || c.ticket_id === complaintId
    );
    if (idx === -1) return null;

    const current = db.complaints[idx];
    const nowIso = new Date().toISOString();

    const updates: Partial<Complaint> = {
      updated_at: nowIso,
    };

    if (action.status) {
      updates.status = action.status;
      if (action.status === "in_progress" && !current.first_responded_at) {
        updates.first_responded_at = nowIso;
      }
      if (action.status === "resolved") {
        updates.resolved_at = nowIso;
        if (action.resolutionNotes) {
          updates.resolution_notes = action.resolutionNotes;
        }
      }
      if (action.status === "verified" || action.status === "closed") {
        updates.verified_at = nowIso;
        updates.closed_at = nowIso;
      }
      if (action.status === "reopened") {
        updates.reopen_count = (current.reopen_count || 0) + 1;
        updates.status = "reopened";
      }
      if (action.status === "rejected") {
        updates.rejection_reason = action.rejectionReason || "Closed by coordinator.";
      }
    }

    if (action.priority) {
      updates.priority = action.priority;
    }

    if (action.assignedTeamId !== undefined) {
      updates.assigned_team_id = action.assignedTeamId;
      updates.assigned_at = nowIso;
    }

    if (action.assignedStaffId !== undefined) {
      updates.assigned_staff_id = action.assignedStaffId;
      updates.assigned_at = nowIso;
    }

    if (action.evidenceUrl) {
      current.attachments = current.attachments || [];
      current.attachments.push({
        id: `att-${Date.now()}`,
        complaint_id: current.id,
        file_url: action.evidenceUrl,
        file_name: "repair-completion-evidence.jpg",
        file_size: 150000,
        file_type: "image/jpeg",
        attachment_type: "repair_evidence",
        uploaded_by: null,
        created_at: nowIso,
      });
    }

    const newHistoryEntry = {
      id: `upd-${Date.now()}`,
      complaint_id: current.id,
      update_type: action.type,
      description: action.description,
      old_value: current.status,
      new_value: action.status || current.status,
      performed_by: null,
      performer_name: action.performerName,
      metadata: {},
      created_at: nowIso,
    };

    const updatedComplaint: Complaint = {
      ...current,
      ...updates,
      updates: [...(current.updates || []), newHistoryEntry],
    };

    db.complaints[idx] = updatedComplaint;
    writeDB(db);
    return updatedComplaint;
  },

  verifyByStudent(token: string, verified: boolean, notes?: string) {
    const db = readDB();
    const complaint = db.complaints.find((c) => c.tracking_token === token);
    if (!complaint) return null;

    if (verified) {
      return this.updateComplaint(complaint.id, {
        type: "verified",
        performerName: complaint.reporter_name || "Student Reporter",
        description: "Student confirmed the repair is resolved satisfactorily via tracking link.",
        status: "verified",
      });
    } else {
      return this.updateComplaint(complaint.id, {
        type: "reopened",
        performerName: complaint.reporter_name || "Student Reporter",
        description: `Student indicated issue is still persistent: "${notes || "Issue not fixed"}"`,
        status: "reopened",
      });
    }
  },

  createLocation(data: Omit<Location, "id" | "public_id" | "created_at" | "updated_at">) {
    const db = readDB();
    const newLoc: Location = {
      ...data,
      id: `loc-${Date.now()}`,
      public_id: `loc-pub-${Math.random().toString(36).substring(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.locations.push(newLoc);
    writeDB(db);
    return newLoc;
  },

  createAsset(data: Omit<Asset, "id" | "public_id" | "created_at" | "updated_at">) {
    const db = readDB();
    const newAsset: Asset = {
      ...data,
      id: `ast-${Date.now()}`,
      public_id: `ast-pub-${Math.random().toString(36).substring(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.assets.push(newAsset);
    writeDB(db);
    return newAsset;
  },

  createStaff(data: Omit<MaintenanceStaff, "id" | "created_at" | "updated_at">) {
    const db = readDB();
    const newStaff: MaintenanceStaff = {
      ...data,
      id: `stf-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.staff.push(newStaff);
    writeDB(db);
    return newStaff;
  },

  updateSlaPolicy(id: string, updates: Partial<SlaPolicy>) {
    const db = readDB();
    const idx = db.slaPolicies.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    db.slaPolicies[idx] = {
      ...db.slaPolicies[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    writeDB(db);
    return db.slaPolicies[idx];
  },

  computeSummary(complaints: Complaint[]): DashboardSummary {
    const total = complaints.length;
    const resolved = complaints.filter((c) =>
      ["resolved", "verified", "closed"].includes(c.status)
    ).length;
    const open = complaints.filter(
      (c) => !["resolved", "verified", "closed", "rejected"].includes(c.status)
    ).length;
    const overdue = complaints.filter((c) => c.is_overdue).length;
    const critical = complaints.filter((c) => c.is_critical_safety).length;

    const unassigned = complaints.filter(
      (c) => c.status === "submitted" && !c.assigned_team_id
    ).length;
    const assigned = complaints.filter((c) => c.status === "assigned").length;
    const inProgress = complaints.filter((c) => c.status === "in_progress").length;
    const awaitingVerification = complaints.filter((c) => c.status === "resolved").length;
    const newComplaints = complaints.filter((c) => c.status === "submitted").length;

    const resolvedWithDeadlines = complaints.filter(
      (c) => ["resolved", "verified", "closed"].includes(c.status) && c.resolution_deadline
    );
    const metCount = resolvedWithDeadlines.filter(
      (c) =>
        c.resolved_at &&
        c.resolution_deadline &&
        new Date(c.resolved_at).getTime() <= new Date(c.resolution_deadline).getTime()
    ).length;
    const slaCompliance =
      resolvedWithDeadlines.length > 0
        ? Math.round((metCount / resolvedWithDeadlines.length) * 100)
        : 100;

    return {
      totalComplaints: total,
      openComplaints: open,
      resolvedComplaints: resolved,
      overdueComplaints: overdue,
      criticalIssues: critical,
      slaCompliance: slaCompliance,
      newComplaints: newComplaints,
      unassignedComplaints: unassigned,
      assignedTasks: assigned,
      inProgressTasks: inProgress,
      awaitingVerification: awaitingVerification,
    };
  },
};
