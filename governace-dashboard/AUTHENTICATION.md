# Authentication Setup

This document describes the authentication system implemented in the Governance Tracker application.

## Overview

The application uses a JWT-based authentication system with the following features:
- Email/password login
- HTTP-only cookie-based session management
- Protected routes using Next.js middleware
- Secure password hashing with bcrypt

## Components

### 1. Login Page (`/app/login/page.tsx`)
A responsive login page with:
- Purple gradient sidebar with ASAFO branding (inspired by design mockup)
- Clean white form area with miLife branding
- Email and password input fields
- Error handling and loading states

### 2. Logout Page (`/app/logout/page.tsx`)
An automatic logout page that:
- Clears the authentication session
- Provides visual feedback during logout
- Redirects to login page after completion

### 3. API Routes

#### Login (`/app/api/auth/login/route.ts`)
- **Method:** POST
- **Body:** `{ email: string, password: string }`
- **Response:** User data (excluding password) and sets HTTP-only cookie
- **Status Codes:**
  - 200: Success
  - 400: Missing email or password
  - 401: Invalid credentials
  - 500: Server error

#### Logout (`/app/api/auth/logout/route.ts`)
- **Method:** POST
- **Response:** Success message and clears authentication cookie
- **Status Codes:**
  - 200: Success
  - 500: Server error

### 4. Middleware (`/middleware.ts`)
Protects all routes except:
- `/login`
- `/api/auth/login`
- Static files

Redirects unauthenticated users to login page with a redirect parameter.

### 5. Navbar Integration
The Navbar component now includes:
- User dropdown menu
- Logout button with icon
- Smooth navigation to logout page

## Setup Instructions

### 1. Environment Variables
Create a `.env` file based on `.env.example`:

\`\`\`bash
cp .env.example .env
\`\`\`

Update the following variables:
- `JWT_SECRET`: Generate a secure random string (use `openssl rand -base64 32`)
- `DATABASE_URL`: Your MySQL database connection string

### 2. Install Dependencies
Dependencies are already installed:
- `bcryptjs` - Password hashing
- `jose` - JWT token handling

### 3. Create Test User

#### Option A: Using the hash-password utility
\`\`\`bash
npx tsx prisma/hash-password.ts "your-password"
\`\`\`

This will output the hashed password and SQL to create a user.

#### Option B: Directly via SQL
\`\`\`sql
INSERT INTO user (email, password, name, createdAt, updatedAt) 
VALUES (
  'admin@milife.com', 
  '$2a$10$...(hashed password)...', 
  'Admin User', 
  NOW(), 
  NOW()
);
\`\`\`

## Usage

### Logging In
1. Navigate to `/login`
2. Enter email and password
3. Click "Login" button
4. On success, redirected to home page
5. Authentication token stored in HTTP-only cookie

### Logging Out
1. Click user dropdown in navbar
2. Click "Logout" button
3. Redirected to `/logout` page
4. Automatically logged out and redirected to `/login`

### Protected Routes
All routes are protected by default except:
- `/login` - Login page
- `/api/auth/login` - Login API endpoint
- Static files (images, CSS, etc.)

Accessing protected routes without authentication redirects to login page.

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
2. **HTTP-Only Cookies**: JWT tokens stored in HTTP-only cookies to prevent XSS attacks
3. **Secure Cookies**: Cookies are marked secure in production
4. **SameSite Protection**: Cookies use strict SameSite policy
5. **Token Expiration**: JWT tokens expire after 24 hours
6. **No Password Exposure**: Passwords are never returned in API responses

## Future Enhancements (Role-Based Access)

The current implementation provides basic authentication. For role-based access control:

1. **User Roles**: The database already supports roles via `userrole` table
2. **Permissions**: Permissions are defined in the `permission` table
3. **Role Permissions**: Mapping in `rolepermission` table

To implement RBAC:
- Add role checking in middleware
- Create permission-based route guards
- Add role context to the application
- Update UI based on user permissions

## Troubleshooting

### Login fails with "Invalid email or password"
- Verify user exists in database
- Check password is correctly hashed
- Verify email is lowercase in database

### Redirects to login immediately after logging in
- Check JWT_SECRET is set in .env
- Verify token is being set in cookies
- Check browser allows cookies

### Token verification fails
- Ensure JWT_SECRET matches between login and middleware
- Check token hasn't expired (24 hour limit)
- Verify cookie is being sent with requests

## Testing

To test the authentication system:

1. Create a test user (see Setup Instructions)
2. Navigate to `http://localhost:3000/login`
3. Enter test credentials
4. Verify successful login and redirect
5. Test protected routes
6. Test logout functionality

## API Reference

### POST /api/auth/login

Request:
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

Success Response (200):
\`\`\`json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "createdAt": "2025-11-10T00:00:00.000Z",
    "updatedAt": "2025-11-10T00:00:00.000Z",
    "userrole": [...],
    "userdepartment": [...]
  }
}
\`\`\`

Error Response (401):
\`\`\`json
{
  "error": "Invalid email or password"
}
\`\`\`

### POST /api/auth/logout

Success Response (200):
\`\`\`json
{
  "message": "Logout successful"
}
\`\`\`
