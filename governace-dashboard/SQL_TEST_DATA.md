# SQL Test Data for Governance Items

## Sample INSERT statements that can be used directly in MySQL

```sql
-- Sample governance items without user/department assignments (as requested)

-- Insert test governance item 1
INSERT INTO governanceitem (
  title, 
  description, 
  status, 
  ownerId, 
  departmentId, 
  dueDate, 
  clauseRefs, 
  progress, 
  tags, 
  visibility, 
  createdAt, 
  updatedAt
)
VALUES (
  'Security Compliance Audit',
  'Comprehensive review of security policies and procedures to ensure compliance with industry standards',
  'NOT_STARTED',
  NULL,
  NULL,
  '2025-12-31 23:59:59',
  JSON_ARRAY('ISO27001 A.5.1', 'ISO27001 A.8.2'),
  0,
  JSON_ARRAY('security', 'compliance', 'audit'),
  'department',
  NOW(3),
  NOW(3)
);

-- Insert test governance item 2
INSERT INTO governanceitem (
  title, 
  description, 
  status, 
  ownerId, 
  departmentId, 
  dueDate, 
  clauseRefs, 
  progress, 
  tags, 
  visibility, 
  createdAt, 
  updatedAt
)
VALUES (
  'Data Privacy Assessment',
  'Evaluate current data handling practices and implement GDPR compliance measures',
  'IN_PROGRESS',
  NULL,
  NULL,
  NULL,
  JSON_ARRAY('GDPR Article 25', 'GDPR Article 32'),
  35,
  JSON_ARRAY('privacy', 'GDPR', 'data-protection'),
  'public',
  NOW(3),
  NOW(3)
);

-- Insert test governance item 3
INSERT INTO governanceitem (
  title, 
  description, 
  status, 
  ownerId, 
  departmentId, 
  dueDate, 
  clauseRefs, 
  progress, 
  tags, 
  visibility, 
  createdAt, 
  updatedAt
)
VALUES (
  'IT Infrastructure Review',
  'Review and upgrade IT infrastructure components for improved performance and security',
  'IN_PROGRESS',
  NULL,
  NULL,
  '2025-12-15 17:00:00',
  JSON_ARRAY('NIST CSF ID.AM-1', 'NIST CSF PR.IP-1'),
  60,
  JSON_ARRAY('IT', 'infrastructure', 'upgrade', 'security'),
  'department',
  NOW(3),
  NOW(3)
);

-- Example with your exact format
INSERT INTO governanceitem (
  id, 
  number, 
  title, 
  description, 
  status, 
  ownerId, 
  departmentId, 
  dueDate, 
  clauseRefs, 
  progress, 
  tags, 
  visibility, 
  createdAt, 
  updatedAt
)
VALUES (
  10,
  '001',
  'Test Governance Item',
  'Testing the governance system functionality',
  'NOT_STARTED',
  NULL,
  NULL,
  NULL,
  JSON_ARRAY('ISO27001 A.5.1'),
  0,
  JSON_ARRAY('pilot', 'draft'),
  'department',
  CURRENT_TIMESTAMP(3),
  CURRENT_TIMESTAMP(3)
);
```

## Notes:

1. **NULL Values**: `ownerId` and `departmentId` are set to NULL as requested since users and departments haven't been created yet.

2. **JSON Fields**: 
   - `tags`: Array of strings stored as JSON
   - `clauseRefs`: Array of compliance references stored as JSON

3. **Status Values**: Must match the enum: `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, `AT_RISK`, `COMPLETED`, `DEFERRED`

4. **Timestamps**: Using `NOW(3)` or `CURRENT_TIMESTAMP(3)` for microsecond precision

5. **ID Field**: Can be auto-incremented (omit from INSERT) or explicitly set as in your example

## API Equivalent:

These SQL inserts are equivalent to these API POST requests:

```bash
# POST /api/governance
curl -X POST http://localhost:3000/api/governance \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Security Compliance Audit",
    "description": "Comprehensive review of security policies and procedures to ensure compliance with industry standards",
    "status": "NOT_STARTED",
    "progress": 0,
    "tags": ["security", "compliance", "audit"],
    "visibility": "department",
    "dueDate": "2025-12-31T23:59:59.000Z"
  }'
```

The API will automatically handle the NULL values for `ownerId` and `departmentId` when they are not provided.