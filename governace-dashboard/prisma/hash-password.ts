import bcrypt from 'bcryptjs';

/**
 * Utility script to hash passwords for testing
 * Run with: npx tsx prisma/hash-password.ts <password>
 */

async function hashPassword(password: string) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log('\n========================================');
  console.log('Password:', password);
  console.log('Hashed:', hashedPassword);
  console.log('========================================\n');
  console.log('You can use this SQL to create a test user:');
  console.log(
    `INSERT INTO user (email, password, name, createdAt, updatedAt) VALUES ('test@example.com', '${hashedPassword}', 'Test User', NOW(), NOW());`
  );
  console.log('========================================\n');
}

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.error('Please provide a password as an argument');
  console.log('Usage: npx tsx prisma/hash-password.ts <password>');
  process.exit(1);
}

hashPassword(password);
