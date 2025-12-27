-- Seed default permissions for the governance tracker system
INSERT INTO
  permission (key, label)
VALUES
  ('users.create', 'Create Users'),
  ('users.read', 'View Users'),
  ('users.update', 'Edit Users'),
  ('users.delete', 'Delete Users'),
  ('roles.create', 'Create Roles'),
  ('roles.read', 'View Roles'),
  ('roles.update', 'Edit Roles'),
  ('roles.delete', 'Delete Roles'),
  ('departments.create', 'Create Departments'),
  ('departments.read', 'View Departments'),
  ('departments.update', 'Edit Departments'),
  ('departments.delete', 'Delete Departments'),
  ('governance.create', 'Create Governance Items'),
  ('governance.read', 'View Governance Items'),
  ('governance.update', 'Edit Governance Items'),
  ('governance.delete', 'Delete Governance Items'),
  ('reports.view', 'View Reports'),
  ('audit.create', 'Create Audit Plans'),
  ('audit.read', 'View Audit Plans'),
  ('audit.update', 'Edit Audit Plans'),
  ('risk.create', 'Create Risk Items'),
  ('risk.read', 'View Risk Items'),
  ('risk.update', 'Edit Risk Items'),
  ('system.admin', 'System Administration') ON DUPLICATE KEY
UPDATE label =
VALUES
  (label);

-- Create default roles
INSERT INTO
  role (name)
VALUES
  ('Administrator'),
  ('Manager'),
  ('User'),
  ('Viewer'),
  ('Auditor') ON DUPLICATE KEY
UPDATE name =
VALUES
  (name);

-- Assign permissions to Administrator role (full access)
INSERT INTO
  rolepermission (roleId, permissionId)
SELECT
  r.id,
  p.id
FROM
  role r,
  permission p
WHERE
  r.name = 'Administrator' ON DUPLICATE KEY
UPDATE roleId =
VALUES
  (roleId);

-- Assign basic permissions to Manager role
INSERT INTO
  rolepermission (roleId, permissionId)
SELECT
  r.id,
  p.id
FROM
  role r,
  permission p
WHERE
  r.name = 'Manager'
  AND p.key IN (
    'users.read',
    'users.create',
    'users.update',
    'roles.read',
    'departments.read',
    'departments.create',
    'departments.update',
    'governance.create',
    'governance.read',
    'governance.update',
    'reports.view',
    'audit.create',
    'audit.read',
    'audit.update',
    'risk.create',
    'risk.read',
    'risk.update'
  ) ON DUPLICATE KEY
UPDATE roleId =
VALUES
  (roleId);

-- Assign read permissions to User role
INSERT INTO
  rolepermission (roleId, permissionId)
SELECT
  r.id,
  p.id
FROM
  role r,
  permission p
WHERE
  r.name = 'User'
  AND p.key IN (
    'users.read',
    'roles.read',
    'departments.read',
    'governance.read',
    'governance.create',
    'governance.update',
    'reports.view',
    'risk.read'
  ) ON DUPLICATE KEY
UPDATE roleId =
VALUES
  (roleId);

-- Assign minimal permissions to Viewer role
INSERT INTO
  rolepermission (roleId, permissionId)
SELECT
  r.id,
  p.id
FROM
  role r,
  permission p
WHERE
  r.name = 'Viewer'
  AND p.key IN ('governance.read', 'reports.view', 'risk.read') ON DUPLICATE KEY
UPDATE roleId =
VALUES
  (roleId);

-- Assign audit permissions to Auditor role
INSERT INTO
  rolepermission (roleId, permissionId)
SELECT
  r.id,
  p.id
FROM
  role r,
  permission p
WHERE
  r.name = 'Auditor'
  AND p.key IN (
    'governance.read',
    'audit.create',
    'audit.read',
    'audit.update',
    'risk.read',
    'reports.view'
  ) ON DUPLICATE KEY
UPDATE roleId =
VALUES
  (roleId);