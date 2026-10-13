-- Smart Campus Care - Complete Database Schema
-- Run this in the Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. INSTITUTIONS
-- ============================================================
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. PROFILES (Authenticated staff users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('principal', 'complaint_team', 'maintenance_staff')),
  institution_id UUID REFERENCES institutions(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. LOCATIONS (Building → Floor → Room hierarchy)
-- ============================================================
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  parent_id UUID REFERENCES locations(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('building', 'floor', 'room', 'area')),
  description TEXT,
  public_id TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
  is_active BOOLEAN DEFAULT true,
  qr_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_locations_institution ON locations(institution_id);
CREATE INDEX idx_locations_parent ON locations(parent_id);
CREATE INDEX idx_locations_public_id ON locations(public_id);
CREATE INDEX idx_locations_type ON locations(type);

-- ============================================================
-- 4. ASSETS (Equipment within locations)
-- ============================================================
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fan', 'light', 'ac', 'projector', 'computer', 'desk', 'chair', 'bench', 'tap', 'pipe', 'door', 'window', 'whiteboard', 'other')),
  identifier TEXT, -- e.g., "Fan #3", "Projector A"
  public_id TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
  is_active BOOLEAN DEFAULT true,
  installed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_assets_location ON assets(location_id);
CREATE INDEX idx_assets_institution ON assets(institution_id);
CREATE INDEX idx_assets_public_id ON assets(public_id);

-- ============================================================
-- 5. MAINTENANCE TEAMS
-- ============================================================
CREATE TABLE maintenance_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL CHECK (specialty IN ('electrical', 'plumbing', 'furniture_carpentry', 'housekeeping', 'it_support', 'general_maintenance')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_teams_institution ON maintenance_teams(institution_id);

-- ============================================================
-- 6. MAINTENANCE STAFF
-- ============================================================
CREATE TABLE maintenance_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  team_id UUID REFERENCES maintenance_teams(id),
  name TEXT NOT NULL,
  phone TEXT,
  specialty TEXT NOT NULL CHECK (specialty IN ('electrical', 'plumbing', 'furniture_carpentry', 'housekeeping', 'it_support', 'general_maintenance')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_staff_team ON maintenance_staff(team_id);
CREATE INDEX idx_staff_institution ON maintenance_staff(institution_id);

-- ============================================================
-- 7. SLA POLICIES
-- ============================================================
CREATE TABLE sla_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'normal', 'low')),
  response_time_minutes INT NOT NULL,
  resolution_time_minutes INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(institution_id, priority)
);

-- ============================================================
-- 8. COMPLAINTS
-- ============================================================
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  ticket_id TEXT UNIQUE NOT NULL,
  location_id UUID NOT NULL REFERENCES locations(id),
  asset_id UUID REFERENCES assets(id),
  
  -- Category and details
  category TEXT NOT NULL CHECK (category IN ('electrical', 'plumbing', 'furniture', 'cleaning', 'it_equipment', 'infrastructure', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Reporter info (anonymous - no auth required)
  reporter_name TEXT,
  reporter_contact TEXT,
  
  -- Tracking security
  tracking_token TEXT UNIQUE NOT NULL, -- hashed token for secure tracking
  tracking_secret TEXT NOT NULL, -- the actual secret given to the student (stored hashed)
  
  -- Status and priority
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'assigned', 'in_progress', 'on_hold', 'resolved', 'verified', 'closed', 'rejected', 'reopened')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('critical', 'high', 'normal', 'low')),
  is_critical_safety BOOLEAN DEFAULT false,
  is_overdue BOOLEAN DEFAULT false,
  is_escalated BOOLEAN DEFAULT false,
  
  -- Assignment
  assigned_team_id UUID REFERENCES maintenance_teams(id),
  assigned_staff_id UUID REFERENCES maintenance_staff(id),
  assigned_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES auth.users(id),
  
  -- Timing
  submitted_at TIMESTAMPTZ DEFAULT now(),
  response_deadline TIMESTAMPTZ,
  resolution_deadline TIMESTAMPTZ,
  first_responded_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  
  -- Resolution
  resolution_notes TEXT,
  rejection_reason TEXT,
  reopen_count INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_complaints_institution ON complaints(institution_id);
CREATE INDEX idx_complaints_ticket ON complaints(ticket_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_location ON complaints(location_id);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_assigned_team ON complaints(assigned_team_id);
CREATE INDEX idx_complaints_assigned_staff ON complaints(assigned_staff_id);
CREATE INDEX idx_complaints_tracking ON complaints(tracking_token);
CREATE INDEX idx_complaints_submitted ON complaints(submitted_at);
CREATE INDEX idx_complaints_overdue ON complaints(is_overdue) WHERE is_overdue = true;
CREATE INDEX idx_complaints_critical ON complaints(is_critical_safety) WHERE is_critical_safety = true;
CREATE INDEX idx_complaints_asset ON complaints(asset_id);

-- ============================================================
-- 9. COMPLAINT ATTACHMENTS
-- ============================================================
CREATE TABLE complaint_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INT,
  file_type TEXT,
  attachment_type TEXT NOT NULL CHECK (attachment_type IN ('complaint_photo', 'repair_evidence', 'other')),
  uploaded_by UUID REFERENCES auth.users(id), -- null for student uploads
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_attachments_complaint ON complaint_attachments(complaint_id);

-- ============================================================
-- 10. COMPLAINT UPDATES (Activity history / audit trail)
-- ============================================================
CREATE TABLE complaint_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL CHECK (update_type IN (
    'submitted', 'assigned', 'reassigned', 'status_change', 'priority_change',
    'comment', 'deadline_change', 'escalated', 'repair_note', 'repair_evidence',
    'verification_requested', 'verified', 'reopened', 'closed', 'rejected',
    'on_hold', 'safety_alert', 'delay_reason'
  )),
  description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  performed_by UUID REFERENCES auth.users(id), -- null for system or student actions
  performer_name TEXT, -- for display: "System", "Student", or user name
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_updates_complaint ON complaint_updates(complaint_id);
CREATE INDEX idx_updates_type ON complaint_updates(update_type);
CREATE INDEX idx_updates_created ON complaint_updates(created_at);

-- ============================================================
-- 11. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'new_complaint', 'assignment', 'status_update', 'deadline_warning',
    'overdue', 'critical_safety', 'resolved', 'verification_needed',
    'reopened', 'escalation', 'recurring_issue'
  )),
  complaint_id UUID REFERENCES complaints(id),
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ============================================================
-- 12. AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID REFERENCES institutions(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_institution ON audit_logs(institution_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================================
-- 13. TICKET SEQUENCE (for unique ticket IDs)
-- ============================================================
CREATE SEQUENCE complaint_ticket_seq START WITH 1001;

-- Function to generate ticket IDs like "SCC-1001"
CREATE OR REPLACE FUNCTION generate_ticket_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'SCC-' || nextval('complaint_ticket_seq')::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 14. UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_institutions_updated BEFORE UPDATE ON institutions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_locations_updated BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_assets_updated BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_teams_updated BEFORE UPDATE ON maintenance_teams FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_staff_updated BEFORE UPDATE ON maintenance_staff FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_sla_updated BEFORE UPDATE ON sla_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_complaints_updated BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 15. AUTO-CREATE PROFILE ON SIGN UP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  inst_id UUID;
BEGIN
  -- Get the first institution (for single-institution setup)
  SELECT id INTO inst_id FROM institutions LIMIT 1;
  
  -- Determine role based on email
  IF NEW.email = 'rikashrikash04@gmail.com' THEN
    user_role := 'principal';
  ELSIF NEW.email = 'mohdnoupa2005@gmail.com' THEN
    user_role := 'complaint_team';
  ELSE
    user_role := NULL; -- Will not create a profile for unauthorized users
  END IF;
  
  IF user_role IS NOT NULL AND inst_id IS NOT NULL THEN
    INSERT INTO profiles (id, email, full_name, avatar_url, role, institution_id)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
      user_role,
      inst_id
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 16. ROW LEVEL SECURITY POLICIES
-- ============================================================

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- INSTITUTIONS
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view their institution"
  ON institutions FOR SELECT
  USING (
    id IN (SELECT institution_id FROM profiles WHERE id = auth.uid())
  );

-- LOCATIONS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active locations"
  ON locations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Principal can manage locations"
  ON locations FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'principal' AND institution_id = locations.institution_id)
  );

-- ASSETS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active assets"
  ON assets FOR SELECT
  USING (is_active = true);

CREATE POLICY "Principal can manage assets"
  ON assets FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'principal' AND institution_id = assets.institution_id)
  );

-- COMPLAINTS
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view institution complaints"
  ON complaints FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND institution_id = complaints.institution_id)
  );

CREATE POLICY "Public can submit complaints"
  ON complaints FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can update complaints"
  ON complaints FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND institution_id = complaints.institution_id)
  );

-- COMPLAINT ATTACHMENTS
ALTER TABLE complaint_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view attachments"
  ON complaint_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM complaints c
      JOIN profiles p ON p.institution_id = c.institution_id
      WHERE c.id = complaint_attachments.complaint_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert attachments"
  ON complaint_attachments FOR INSERT
  WITH CHECK (true);

-- COMPLAINT UPDATES
ALTER TABLE complaint_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view complaint updates"
  ON complaint_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM complaints c
      JOIN profiles p ON p.institution_id = c.institution_id
      WHERE c.id = complaint_updates.complaint_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "Staff can insert complaint updates"
  ON complaint_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM complaints c
      JOIN profiles p ON p.institution_id = c.institution_id
      WHERE c.id = complaint_updates.complaint_id AND p.id = auth.uid()
    )
  );

-- MAINTENANCE TEAMS
ALTER TABLE maintenance_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view teams"
  ON maintenance_teams FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND institution_id = maintenance_teams.institution_id)
  );

CREATE POLICY "Principal can manage teams"
  ON maintenance_teams FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'principal' AND institution_id = maintenance_teams.institution_id)
  );

CREATE POLICY "Complaint team can manage teams"
  ON maintenance_teams FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'complaint_team' AND institution_id = maintenance_teams.institution_id)
  );

-- MAINTENANCE STAFF
ALTER TABLE maintenance_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff users can view maintenance staff"
  ON maintenance_staff FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND institution_id = maintenance_staff.institution_id)
  );

CREATE POLICY "Complaint team can manage maintenance staff"
  ON maintenance_staff FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'complaint_team' AND institution_id = maintenance_staff.institution_id)
  );

-- SLA POLICIES
ALTER TABLE sla_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view SLA policies"
  ON sla_policies FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND institution_id = sla_policies.institution_id)
  );

CREATE POLICY "Principal can manage SLA policies"
  ON sla_policies FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'principal' AND institution_id = sla_policies.institution_id)
  );

-- NOTIFICATIONS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- AUDIT LOGS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Principal can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'principal' AND institution_id = audit_logs.institution_id)
  );

-- ============================================================
-- 17. SEED DATA - Default Institution and SLA Policies
-- ============================================================
INSERT INTO institutions (name, code, address) 
VALUES ('Smart Campus Care Institution', 'SCC-001', 'Main Campus');

-- Get the institution ID for SLA policies
DO $$
DECLARE
  inst_id UUID;
BEGIN
  SELECT id INTO inst_id FROM institutions WHERE code = 'SCC-001';
  
  INSERT INTO sla_policies (institution_id, priority, response_time_minutes, resolution_time_minutes) VALUES
    (inst_id, 'critical', 30, 240),      -- 30 min response, 4 hours resolution
    (inst_id, 'high', 60, 720),           -- 1 hour response, 12 hours resolution
    (inst_id, 'normal', 120, 1440),       -- 2 hours response, 24 hours resolution
    (inst_id, 'low', 240, 2880);          -- 4 hours response, 48 hours resolution

  -- Seed some sample locations
  INSERT INTO locations (institution_id, name, type, description) VALUES
    (inst_id, 'Main Building', 'building', 'Primary academic building');
    
  -- Get building ID for floors
  DECLARE
    building_id UUID;
  BEGIN
    SELECT id INTO building_id FROM locations WHERE institution_id = inst_id AND name = 'Main Building';
    
    INSERT INTO locations (institution_id, parent_id, name, type, description) VALUES
      (inst_id, building_id, 'Ground Floor', 'floor', 'Ground floor of Main Building'),
      (inst_id, building_id, 'First Floor', 'floor', 'First floor of Main Building'),
      (inst_id, building_id, 'Second Floor', 'floor', 'Second floor of Main Building');
    
    -- Get ground floor ID for rooms
    DECLARE
      floor_id UUID;
    BEGIN
      SELECT id INTO floor_id FROM locations WHERE institution_id = inst_id AND parent_id = building_id AND name = 'Ground Floor';
      
      INSERT INTO locations (institution_id, parent_id, name, type, description) VALUES
        (inst_id, floor_id, 'Room 101 - Classroom', 'room', 'Ground floor classroom'),
        (inst_id, floor_id, 'Room 102 - Computer Lab', 'room', 'Computer laboratory'),
        (inst_id, floor_id, 'Room 103 - Library', 'room', 'Main library'),
        (inst_id, floor_id, 'Washroom - Ground Floor', 'room', 'Ground floor washroom');
    END;
  END;

  -- Create default maintenance teams
  INSERT INTO maintenance_teams (institution_id, name, specialty) VALUES
    (inst_id, 'Electrical Team', 'electrical'),
    (inst_id, 'Plumbing Team', 'plumbing'),
    (inst_id, 'Furniture & Carpentry', 'furniture_carpentry'),
    (inst_id, 'Housekeeping', 'housekeeping'),
    (inst_id, 'IT Support', 'it_support'),
    (inst_id, 'General Maintenance', 'general_maintenance');
END $$;

-- ============================================================
-- 18. STORAGE BUCKETS (run in Supabase dashboard or via API)
-- ============================================================
-- Create storage bucket for complaint attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('complaint-attachments', 'complaint-attachments', true);

-- Storage policies
CREATE POLICY "Anyone can upload complaint attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'complaint-attachments');

CREATE POLICY "Anyone can view complaint attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'complaint-attachments');
