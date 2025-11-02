import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function seedPermissionsAndRoles() {
  console.log('🌱 Seeding permissions and roles...');

  // Create permissions
  const permissions = [
    { key: 'users.create', label: 'Create Users' },
    { key: 'users.read', label: 'View Users' },
    { key: 'users.update', label: 'Edit Users' },
    { key: 'users.delete', label: 'Delete Users' },
    { key: 'roles.create', label: 'Create Roles' },
    { key: 'roles.read', label: 'View Roles' },
    { key: 'roles.update', label: 'Edit Roles' },
    { key: 'roles.delete', label: 'Delete Roles' },
    { key: 'departments.create', label: 'Create Departments' },
    { key: 'departments.read', label: 'View Departments' },
    { key: 'departments.update', label: 'Edit Departments' },
    { key: 'departments.delete', label: 'Delete Departments' },
    { key: 'governance.create', label: 'Create Governance Items' },
    { key: 'governance.read', label: 'View Governance Items' },
    { key: 'governance.update', label: 'Edit Governance Items' },
    { key: 'governance.delete', label: 'Delete Governance Items' },
    { key: 'reports.view', label: 'View Reports' },
    { key: 'audit.create', label: 'Create Audit Plans' },
    { key: 'audit.read', label: 'View Audit Plans' },
    { key: 'audit.update', label: 'Edit Audit Plans' },
    { key: 'risk.create', label: 'Create Risk Items' },
    { key: 'risk.read', label: 'View Risk Items' },
    { key: 'risk.update', label: 'Edit Risk Items' },
    { key: 'system.admin', label: 'System Administration' },
  ];

  // Create permissions using upsert to avoid duplicates
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: { label: permission.label },
      create: permission,
    });
  }

  console.log(`✅ Created ${permissions.length} permissions`);

  // Create roles
  const roles = [
    { name: 'Administrator' },
    { name: 'Manager' },
    { name: 'User' },
    { name: 'Viewer' },
    { name: 'Auditor' },
  ];

  const createdRoles = [];
  for (const role of roles) {
    const createdRole = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    createdRoles.push(createdRole);
  }

  console.log(`✅ Created ${createdRoles.length} roles`);

  // Assign permissions to roles
  const rolePermissions = {
    'Administrator': permissions.map(p => p.key), // All permissions
    'Manager': [
      'users.read', 'users.create', 'users.update',
      'roles.read',
      'departments.read', 'departments.create', 'departments.update',
      'governance.create', 'governance.read', 'governance.update',
      'reports.view',
      'audit.create', 'audit.read', 'audit.update',
      'risk.create', 'risk.read', 'risk.update'
    ],
    'User': [
      'users.read',
      'roles.read',
      'departments.read',
      'governance.read', 'governance.create', 'governance.update',
      'reports.view',
      'risk.read'
    ],
    'Viewer': [
      'governance.read',
      'reports.view',
      'risk.read'
    ],
    'Auditor': [
      'governance.read',
      'audit.create', 'audit.read', 'audit.update',
      'risk.read',
      'reports.view'
    ]
  };

  // Clear existing role permissions and create new ones
  for (const [roleName, permissionKeys] of Object.entries(rolePermissions)) {
    const role = await prisma.role.findUnique({
      where: { name: roleName }
    });

    if (role) {
      // Delete existing permissions for this role
      await prisma.rolepermission.deleteMany({
        where: { roleId: role.id }
      });

      // Create new permissions
      const rolePermissionData = [];
      for (const permissionKey of permissionKeys) {
        const permission = await prisma.permission.findUnique({
          where: { key: permissionKey }
        });
        
        if (permission) {
          rolePermissionData.push({
            roleId: role.id,
            permissionId: permission.id
          });
        }
      }

      if (rolePermissionData.length > 0) {
        await prisma.rolepermission.createMany({
          data: rolePermissionData
        });
      }

      console.log(`✅ Assigned ${rolePermissionData.length} permissions to ${roleName}`);
    }
  }

  console.log('🎉 Seeding completed!');
}

// Run the seeding function
seedPermissionsAndRoles()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });