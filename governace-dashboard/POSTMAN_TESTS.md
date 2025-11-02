# Governance API - Postman Test Samples

## Base URL
```
http://localhost:3000/api/governance
```

---

## 1. GET - List Governance Items

### Basic Request
```
GET http://localhost:3000/api/governance
```

### With Query Parameters
```
GET http://localhost:3000/api/governance?page=1&limit=5&status=IN_PROGRESS&search=audit
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status (`NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, `AT_RISK`, `COMPLETED`, `DEFERRED`)
- `departmentId` (optional): Filter by department ID
- `ownerId` (optional): Filter by owner ID
- `search` (optional): Search in title and description

**Expected Response:**
```json
{
  "items": [
    {
      "id": 1,
      "number": null,
      "title": "Sample Governance Item",
      "description": "This is a sample description",
      "status": "IN_PROGRESS",
      "ownerId": 1,
      "owner": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "departmentId": 1,
      "department": {
        "id": 1,
        "name": "IT Department",
        "code": "IT"
      },
      "dueDate": "2025-11-15T10:00:00.000Z",
      "clauseRefs": null,
      "progress": 45,
      "tags": ["compliance", "security"],
      "visibility": "department",
      "createdAt": "2025-10-28T10:00:00.000Z",
      "updatedAt": "2025-10-28T10:00:00.000Z",
      "_count": {
        "subtasks": 3,
        "comments": 2,
        "attachments": 1
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

## 2. POST - Create Governance Item

### Request
```
POST http://localhost:3000/api/governance
Content-Type: application/json
```

### Minimal Request Body (Recommended for now)
```json
{
  "title": "New Governance Item",
  "description": "This is a new governance item for testing"
}
```

### Complete Request Body (without user/department assignment)
```json
{
  "title": "Comprehensive Security Audit",
  "description": "Conduct a thorough security audit of all IT systems and processes to ensure compliance with industry standards",
  "status": "NOT_STARTED",
  "dueDate": "2025-12-31T23:59:59.000Z",
  "progress": 0,
  "tags": ["security", "audit", "compliance", "IT"],
  "visibility": "department"
}
```

### Request Body with Optional Fields
```json
{
  "title": "Data Privacy Assessment",
  "description": "Review current data handling practices and ensure GDPR compliance",
  "status": "IN_PROGRESS",
  "progress": 25,
  "tags": ["privacy", "GDPR", "data"],
  "visibility": "public"
}
```

### Request Body with User/Department (when they exist later)
```json
{
  "title": "Future Item with Assignments",
  "description": "This will be assigned later when users and departments are created",
  "status": "NOT_STARTED",
  "ownerId": 1,
  "departmentId": 1,
  "progress": 0,
  "tags": ["future", "assignment"],
  "visibility": "department"
}
```

**Field Descriptions:**
- `title` (required): String, 1-255 characters
- `description` (required): String, minimum 1 character
- `status` (optional): Enum - `NOT_STARTED` (default), `IN_PROGRESS`, `BLOCKED`, `AT_RISK`, `COMPLETED`, `DEFERRED`
- `ownerId` (optional): Number - ID of the owner user
- `departmentId` (optional): Number - ID of the department
- `dueDate` (optional): ISO datetime string
- `progress` (optional): Number 0-100 (default: 0)
- `tags` (optional): Array of strings (default: [])
- `visibility` (optional): Enum - `department` (default), `public`, `private`

**Expected Response (201 Created):**
```json
{
  "id": 2,
  "number": null,
  "title": "Comprehensive Security Audit",
  "description": "Conduct a thorough security audit of all IT systems and processes to ensure compliance with industry standards",
  "status": "NOT_STARTED",
  "ownerId": null,
  "owner": null,
  "departmentId": null,
  "department": null,
  "dueDate": "2025-12-31T23:59:59.000Z",
  "clauseRefs": null,
  "progress": 0,
  "tags": ["security", "audit", "compliance", "IT"],
  "visibility": "department",
  "createdAt": "2025-11-01T10:00:00.000Z",
  "updatedAt": "2025-11-01T10:00:00.000Z"
}
```

---

## 3. GET - Single Governance Item

### Request
```
GET http://localhost:3000/api/governance/1
```

**Expected Response:**
```json
{
  "id": 1,
  "number": null,
  "title": "Sample Governance Item",
  "description": "This is a sample description",
  "status": "IN_PROGRESS",
  "ownerId": 1,
  "owner": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "departmentId": 1,
  "department": {
    "id": 1,
    "name": "IT Department",
    "code": "IT"
  },
  "dueDate": "2025-11-15T10:00:00.000Z",
  "clauseRefs": null,
  "progress": 45,
  "tags": ["compliance", "security"],
  "visibility": "department",
  "createdAt": "2025-10-28T10:00:00.000Z",
  "updatedAt": "2025-10-28T10:00:00.000Z",
  "subtasks": [
    {
      "id": 1,
      "itemId": 1,
      "title": "Review current policies",
      "done": true,
      "dueDate": null,
      "assigneeId": 1,
      "assignee": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "raci": [
    {
      "id": 1,
      "itemId": 1,
      "userId": 1,
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "role": "R"
    }
  ],
  "attachments": [],
  "comments": [],
  "_count": {
    "subtasks": 1,
    "comments": 0,
    "attachments": 0
  }
}
```

---

## 4. PUT - Update Governance Item

### Request
```
PUT http://localhost:3000/api/governance/1
Content-Type: application/json
```

### Partial Update Example 1 - Status and Progress
```json
{
  "status": "IN_PROGRESS",
  "progress": 75
}
```

### Partial Update Example 2 - Title and Description
```json
{
  "title": "Updated Security Audit Title",
  "description": "Updated description with more details about the security audit process"
}
```

### Complete Update Example
```json
{
  "title": "Final Security Audit Report",
  "description": "Complete security audit with findings and recommendations",
  "status": "COMPLETED",
  "progress": 100,
  "ownerId": 2,
  "departmentId": 2,
  "dueDate": "2025-11-30T23:59:59.000Z",
  "tags": ["security", "audit", "completed", "report"],
  "visibility": "public"
}
```

### Remove Owner and Department
```json
{
  "ownerId": null,
  "departmentId": null
}
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "number": null,
  "title": "Final Security Audit Report",
  "description": "Complete security audit with findings and recommendations",
  "status": "COMPLETED",
  "ownerId": 2,
  "owner": {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com"
  },
  "departmentId": 2,
  "department": {
    "id": 2,
    "name": "Security Department",
    "code": "SEC"
  },
  "dueDate": "2025-11-30T23:59:59.000Z",
  "clauseRefs": null,
  "progress": 100,
  "tags": ["security", "audit", "completed", "report"],
  "visibility": "public",
  "createdAt": "2025-10-28T10:00:00.000Z",
  "updatedAt": "2025-10-28T12:00:00.000Z"
}
```

---

## 5. DELETE - Delete Governance Item

### Request
```
DELETE http://localhost:3000/api/governance/1
```

**Expected Response (200 OK):**
```json
{
  "message": "Governance item deleted successfully"
}
```

---

## Error Response Examples

### 400 Bad Request - Validation Error
```json
{
  "errors": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "Title is required",
      "path": ["title"]
    }
  ]
}
```

### 404 Not Found
```json
{
  "error": "Governance item not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Testing Scenarios

### 1. Create Test Data
```json
POST /api/governance
{
  "title": "Test Item 1",
  "description": "First test item",
  "status": "NOT_STARTED"
}

POST /api/governance
{
  "title": "Test Item 2", 
  "description": "Second test item",
  "status": "IN_PROGRESS",
  "progress": 50
}

POST /api/governance
{
  "title": "Test Item 3",
  "description": "Third test item", 
  "status": "COMPLETED",
  "progress": 100
}
```

### 2. Test Filtering
```
GET /api/governance?status=IN_PROGRESS
GET /api/governance?search=test
GET /api/governance?page=1&limit=2
```

### 3. Test Updates
```
PUT /api/governance/1
{
  "progress": 25
}

PUT /api/governance/2  
{
  "status": "COMPLETED",
  "progress": 100
}
```

### 4. Test Validation Errors
```json
POST /api/governance
{
  "title": "",
  "description": ""
}

PUT /api/governance/1
{
  "progress": 150
}
```

### 5. Test 404 Scenarios
```
GET /api/governance/999
PUT /api/governance/999
DELETE /api/governance/999
```

---

## Notes for Testing

1. **Database Setup**: Make sure you have a MySQL database running and properly configured
2. **Sample Data**: You may need to create some users and departments first to test owner/department assignments
3. **Date Format**: Always use ISO datetime format for `dueDate` field
4. **Status Values**: Use exact enum values (case-sensitive)
5. **ID References**: Use valid user and department IDs that exist in your database