# Image Upload Test Instructions

## Testing the Image Upload Functionality

1. **Open the application**: Go to http://localhost:3003/users

2. **Create a new user**:
   - Click "Add User" button
   - Fill in the required fields (Name, Email, Password)
   - In the "Profile Image" section, you can now:
     - Drag and drop an image file
     - Click "Click to upload" to select a file
     - Supported formats: JPEG, PNG, GIF, WebP
     - Maximum size: 5MB

3. **Edit existing user**:
   - Click the edit icon for any user
   - Use the same image upload interface
   - You can replace or remove existing images

## Upload Process

1. When you select/drop an image:
   - File is validated (type and size)
   - File is uploaded to `/public/uploads/avatars/`
   - Unique filename is generated with timestamp
   - Database URL is updated with the new path

2. Image Display:
   - Images are served from `/uploads/avatars/{filename}`
   - Preview is shown immediately after upload
   - Remove button (×) allows deleting the image

## File Storage

- Images are stored in: `public/uploads/avatars/`
- URLs saved to database: `/uploads/avatars/{unique-filename}`
- Files have unique names to prevent conflicts

## Validation

- **File Types**: JPEG, PNG, GIF, WebP only
- **File Size**: Maximum 5MB
- **Error Handling**: Clear error messages for invalid files