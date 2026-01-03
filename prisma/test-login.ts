/**
 * Test script to verify login credentials
 * Run with: npx tsx prisma/test-login.ts
 */

import bcrypt from 'bcryptjs';
import prisma from './client';

async function testLogin() {
  const email = 'andrew.laryea@milifeghana.com';
  const password = 'Andrew98L';

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.log('❌ User not found!');
      console.log('\nRun this SQL to create the user:');
      console.log('------------------------------------');
      console.log(`INSERT INTO user (email, password, name, createdAt, updatedAt)`);
      console.log(`VALUES ('${email}', '$2b$10$QthrM0pg0J3Pd.PnjqCJKeNFNGbQnxyzV0BHLmUSRMquZHeEL8o0C', 'Andrew Laryea', NOW(), NOW());`);
      console.log('------------------------------------\n');
      return;
    }

    console.log('✅ User found!');
    console.log('User ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', user.name);

    // Test password
    const isValid = await bcrypt.compare(password, user.password);

    if (isValid) {
      console.log('✅ Password is correct!');
      console.log('\n🎉 You can now login with:');
      console.log('Email:', email);
      console.log('Password: Andrew98L');
    } else {
      console.log('❌ Password is incorrect!');
      console.log('\nRun this SQL to update the password:');
      console.log('------------------------------------');
      console.log(`UPDATE user SET password = '$2b$10$QthrM0pg0J3Pd.PnjqCJKeNFNGbQnxyzV0BHLmUSRMquZHeEL8o0C', updatedAt = NOW() WHERE email = '${email}';`);
      console.log('------------------------------------\n');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
