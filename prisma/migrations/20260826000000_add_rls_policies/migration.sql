-- Enable Row Level Security
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "College" ENABLE ROW LEVEL SECURITY;

-- Create policies for User
CREATE POLICY tenant_isolation_user ON "User"
FOR ALL
USING (
  current_setting('app.current_role', true) = 'SUPER_ADMIN' OR
  (current_setting('app.current_role', true) = 'ADMIN' AND "collegeId"::text = current_setting('app.current_college_id', true)) OR
  current_setting('app.current_role', true) IS NULL OR current_setting('app.current_role', true) = ''
);

-- Create policies for Subscription
CREATE POLICY tenant_isolation_subscription ON "Subscription"
FOR ALL
USING (
  current_setting('app.current_role', true) = 'SUPER_ADMIN' OR
  (current_setting('app.current_role', true) = 'ADMIN' AND "collegeId"::text = current_setting('app.current_college_id', true)) OR
  current_setting('app.current_role', true) IS NULL OR current_setting('app.current_role', true) = ''
);

-- Create policies for AuditLog
CREATE POLICY tenant_isolation_auditlog ON "AuditLog"
FOR ALL
USING (
  current_setting('app.current_role', true) = 'SUPER_ADMIN' OR
  -- We assume AuditLog has an actorId which belongs to a User, or we bypass for now if not strictly tenant scoped via column.
  -- Actually, the requirement asks for AuditLog to be isolated. The schema has no collegeId on AuditLog, only actorId.
  -- A robust RLS on AuditLog would join User. 
  (current_setting('app.current_role', true) = 'ADMIN' AND "actorId" IN (SELECT id FROM "User" WHERE "collegeId"::text = current_setting('app.current_college_id', true))) OR
  current_setting('app.current_role', true) IS NULL OR current_setting('app.current_role', true) = ''
);

-- Create policies for College
CREATE POLICY tenant_isolation_college ON "College"
FOR ALL
USING (
  current_setting('app.current_role', true) = 'SUPER_ADMIN' OR
  (current_setting('app.current_role', true) = 'ADMIN' AND "id"::text = current_setting('app.current_college_id', true)) OR
  current_setting('app.current_role', true) IS NULL OR current_setting('app.current_role', true) = ''
);
