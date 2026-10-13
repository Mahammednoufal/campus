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

export const DataStore = {
  // Fetch full live snapshot from persistent API
  async fetchLiveSnapshot() {
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("fetchLiveSnapshot error:", err);
    }
    return null;
  },

  async getComplaintsAsync(): Promise<Complaint[]> {
    try {
      const res = await fetch("/api/complaints", { cache: "no-store" });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("getComplaintsAsync error:", err);
    }
    return [];
  },

  async createComplaintAsync(data: {
    category: ComplaintCategory;
    title: string;
    description: string;
    location_id: string;
    asset_id?: string | null;
    reporter_name?: string | null;
    reporter_contact?: string | null;
    photo_url?: string | null;
  }): Promise<{ complaint: Complaint; tracking_secret: string }> {
    const res = await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error("Failed to submit complaint");
    }
    return await res.json();
  },

  async updateComplaintWorkflowAsync(
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
  ): Promise<Complaint> {
    const res = await fetch(`/api/complaints/${complaintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action),
    });
    if (!res.ok) {
      throw new Error("Failed to update complaint workflow");
    }
    return await res.json();
  },

  async verifyByStudentAsync(
    token: string,
    verified: boolean,
    notes?: string
  ): Promise<Complaint> {
    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, verified, notes }),
    });
    if (!res.ok) {
      throw new Error("Failed to verify complaint");
    }
    return await res.json();
  },
};
