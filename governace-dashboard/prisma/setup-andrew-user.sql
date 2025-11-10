-- SQL to create or update user: andrew.laryea@milifeghana.com
-- Password: Andrew98L (hashed)
-- Option 1: Insert new user (use this if user doesn't exist)
INSERT INTO
  user(email, password, name, createdAt, updatedAt)
VALUES
  (
    'andrew.laryea@milifeghana.com',
    '$2b$10$QthrM0pg0J3Pd.PnjqCJKeNFNGbQnxyzV0BHLmUSRMquZHeEL8o0C',
    'Andrew Laryea',
    NOW(),
    NOW()
  );

-- Option 2: Update existing user password (use this if user already exists)
UPDATE user
SET password = '$2b$10$QthrM0pg0J3Pd.PnjqCJKeNFNGbQnxyzV0BHLmUSRMquZHeEL8o0C',
updatedAt = NOW()
WHERE
  email = 'andrew.laryea@milifeghana.com';

-- Verify the user
SELECT
  id,
  email,
  name,
  createdAt
FROM
  user
WHERE
  email = 'andrew.laryea@milifeghana.com';