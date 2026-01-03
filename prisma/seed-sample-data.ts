import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSampleData() {
  console.log('🌱 Seeding sample data for Risk, Compliance, and Audit...');

  try {
    // Get existing departments and users
    const departments = await prisma.department.findMany();
    const users = await prisma.user.findMany();
    const governanceItems = await prisma.governanceItem.findMany();

    if (departments.length === 0 || users.length === 0) {
      console.log('⚠️  Please create departments and users first');
      return;
    }

    const itDept = departments.find(d => d.name.toLowerCase().includes('it')) || departments[0];
    const financeDept = departments.find(d => d.name.toLowerCase().includes('finance')) || departments[1] || departments[0];
    const hrDept = departments.find(d => d.name.toLowerCase().includes('hr') || d.name.toLowerCase().includes('human')) || departments[2] || departments[0];
    
    const mainUser = users[0];
    const secondUser = users[1] || users[0];

    // 1. SEED POLICIES
    console.log('📋 Creating sample policies...');
    
    const policies = [
      {
        code: 'POL-001',
        title: 'Information Security Policy',
        description: 'Defines the organization\'s approach to protecting information assets, including data classification, access controls, and incident response procedures.',
        category: 'Security',
        status: 'APPROVED' as const,
        version: '2.0',
        ownerId: mainUser.id,
        departmentId: itDept.id,
        approvedBy: secondUser.id,
        approvedDate: new Date('2025-01-15'),
        effectiveDate: new Date('2025-02-01'),
        reviewDate: new Date('2026-02-01'),
      },
      {
        code: 'POL-002',
        title: 'Data Protection and Privacy Policy',
        description: 'Outlines requirements for handling personal data in compliance with GDPR and local data protection laws.',
        category: 'Privacy',
        status: 'APPROVED' as const,
        version: '1.5',
        ownerId: mainUser.id,
        departmentId: itDept.id,
        approvedBy: secondUser.id,
        approvedDate: new Date('2025-01-10'),
        effectiveDate: new Date('2025-01-15'),
        reviewDate: new Date('2026-01-15'),
      },
      {
        code: 'POL-003',
        title: 'Access Control Policy',
        description: 'Establishes guidelines for user access management, authentication, and authorization across IT systems.',
        category: 'Security',
        status: 'APPROVED' as const,
        version: '1.0',
        ownerId: mainUser.id,
        departmentId: itDept.id,
        approvedBy: secondUser.id,
        approvedDate: new Date('2024-12-01'),
        effectiveDate: new Date('2024-12-15'),
        reviewDate: new Date('2025-12-15'),
      },
      {
        code: 'POL-004',
        title: 'Business Continuity Policy',
        description: 'Defines procedures to ensure critical business functions continue during and after a disaster or disruption.',
        category: 'Operations',
        status: 'UNDER_REVIEW' as const,
        version: '1.0',
        ownerId: secondUser.id,
        departmentId: itDept.id,
        effectiveDate: new Date('2025-03-01'),
        reviewDate: new Date('2026-03-01'),
      },
      {
        code: 'POL-005',
        title: 'Acceptable Use Policy',
        description: 'Defines acceptable and unacceptable use of company IT resources, including email, internet, and devices.',
        category: 'Security',
        status: 'APPROVED' as const,
        version: '2.1',
        ownerId: mainUser.id,
        departmentId: hrDept.id,
        approvedBy: secondUser.id,
        approvedDate: new Date('2024-11-01'),
        effectiveDate: new Date('2024-11-15'),
        reviewDate: new Date('2025-11-15'),
      },
    ];

    const createdPolicies = [];
    for (const policy of policies) {
      const created = await prisma.policy.create({ data: policy });
      createdPolicies.push(created);
    }
    console.log(`✅ Created ${createdPolicies.length} policies`);

    // 2. SEED CONTROLS
    console.log('🛡️  Creating sample controls...');

    const controls = [
      {
        code: 'CTRL-001',
        title: 'Multi-Factor Authentication',
        description: 'All users must use multi-factor authentication for accessing critical systems and data.',
        category: 'Access Control',
        status: 'ACTIVE' as const,
        frequency: 'CONTINUOUS' as const,
        ownerId: mainUser.id,
        departmentId: itDept.id,
        policyId: createdPolicies[2].id, // Access Control Policy
        effectiveness: 85,
        lastReviewed: new Date('2025-10-15'),
        nextReview: new Date('2026-01-15'),
      },
      {
        code: 'CTRL-002',
        title: 'Data Encryption at Rest',
        description: 'All sensitive data must be encrypted when stored using AES-256 or equivalent encryption standards.',
        category: 'Data Protection',
        status: 'ACTIVE' as const,
        frequency: 'CONTINUOUS' as const,
        ownerId: mainUser.id,
        departmentId: itDept.id,
        policyId: createdPolicies[0].id, // Information Security Policy
        effectiveness: 90,
        lastReviewed: new Date('2025-09-01'),
        nextReview: new Date('2025-12-01'),
      },
      {
        code: 'CTRL-003',
        title: 'Regular Security Awareness Training',
        description: 'All employees must complete security awareness training annually and pass the assessment.',
        category: 'Training',
        status: 'ACTIVE' as const,
        frequency: 'ANNUALLY' as const,
        ownerId: secondUser.id,
        departmentId: hrDept.id,
        policyId: createdPolicies[0].id,
        effectiveness: 75,
        lastReviewed: new Date('2025-08-01'),
        nextReview: new Date('2026-08-01'),
      },
      {
        code: 'CTRL-004',
        title: 'Quarterly Vulnerability Scanning',
        description: 'Perform automated vulnerability scans on all systems and infrastructure quarterly.',
        category: 'Security Testing',
        status: 'ACTIVE' as const,
        frequency: 'QUARTERLY' as const,
        ownerId: mainUser.id,
        departmentId: itDept.id,
        policyId: createdPolicies[0].id,
        effectiveness: 80,
        lastReviewed: new Date('2025-10-01'),
        nextReview: new Date('2026-01-01'),
      },
      {
        code: 'CTRL-005',
        title: 'Access Review Process',
        description: 'Review and validate user access rights monthly to ensure principle of least privilege.',
        category: 'Access Control',
        status: 'ACTIVE' as const,
        frequency: 'MONTHLY' as const,
        ownerId: mainUser.id,
        departmentId: itDept.id,
        policyId: createdPolicies[2].id,
        effectiveness: 70,
        lastReviewed: new Date('2025-11-01'),
        nextReview: new Date('2025-12-01'),
      },
      {
        code: 'CTRL-006',
        title: 'Backup and Recovery Testing',
        description: 'Test backup restoration procedures monthly to ensure data can be recovered.',
        category: 'Business Continuity',
        status: 'ACTIVE' as const,
        frequency: 'MONTHLY' as const,
        ownerId: mainUser.id,
        departmentId: itDept.id,
        policyId: createdPolicies[3].id,
        effectiveness: 88,
        lastReviewed: new Date('2025-11-05'),
        nextReview: new Date('2025-12-05'),
      },
      {
        code: 'CTRL-007',
        title: 'Privacy Impact Assessment',
        description: 'Conduct privacy impact assessments for new systems or processes that handle personal data.',
        category: 'Privacy',
        status: 'ACTIVE' as const,
        frequency: 'AD_HOC' as const,
        ownerId: mainUser.id,
        departmentId: itDept.id,
        policyId: createdPolicies[1].id,
        effectiveness: 78,
        lastReviewed: new Date('2025-09-15'),
        nextReview: new Date('2026-03-15'),
      },
      {
        code: 'CTRL-008',
        title: 'Incident Response Plan Review',
        description: 'Review and update incident response procedures semi-annually.',
        category: 'Incident Management',
        status: 'UNDER_REVIEW' as const,
        frequency: 'QUARTERLY' as const,
        ownerId: secondUser.id,
        departmentId: itDept.id,
        policyId: createdPolicies[0].id,
        lastReviewed: new Date('2025-07-01'),
        nextReview: new Date('2025-11-30'),
      },
    ];

    const createdControls = [];
    for (const control of controls) {
      const created = await prisma.control.create({ data: control });
      createdControls.push(created);
    }
    console.log(`✅ Created ${createdControls.length} controls`);

    // 3. SEED RISKS
    console.log('⚠️  Creating sample risks...');

    const risks = [
      {
        title: 'Unauthorized Access to Sensitive Data',
        ownerId: mainUser.id,
        impact: 5,
        likelihood: 3,
        rating: 15,
        status: 'IN_PROGRESS' as const,
        notes: 'Mitigation: Implementing MFA and access reviews. Current controls reducing likelihood.',
        relatedItemId: governanceItems.length > 0 ? governanceItems[0].id : null,
        departmentId: itDept.id,
      },
      {
        title: 'Data Breach Due to Ransomware Attack',
        ownerId: mainUser.id,
        impact: 5,
        likelihood: 4,
        rating: 20,
        status: 'IN_PROGRESS' as const,
        notes: 'High priority risk. Implementing enhanced email filtering, endpoint protection, and employee training.',
        relatedItemId: governanceItems.length > 0 ? governanceItems[0].id : null,
        departmentId: itDept.id,
      },
      {
        title: 'Non-Compliance with GDPR Requirements',
        ownerId: secondUser.id,
        impact: 4,
        likelihood: 2,
        rating: 8,
        status: 'IN_PROGRESS' as const,
        notes: 'Privacy impact assessments being conducted. Data mapping in progress.',
        relatedItemId: governanceItems.length > 1 ? governanceItems[1].id : null,
        departmentId: itDept.id,
      },
      {
        title: 'System Downtime Exceeding RTO',
        ownerId: mainUser.id,
        impact: 4,
        likelihood: 2,
        rating: 8,
        status: 'IN_PROGRESS' as const,
        notes: 'Backup and recovery procedures being enhanced. Redundancy improvements planned.',
        departmentId: itDept.id,
      },
      {
        title: 'Insider Threat - Data Exfiltration',
        ownerId: mainUser.id,
        impact: 4,
        likelihood: 2,
        rating: 8,
        status: 'IN_PROGRESS' as const,
        notes: 'Implementing DLP tools and user activity monitoring. Access controls being strengthened.',
        departmentId: itDept.id,
      },
      {
        title: 'Third-Party Vendor Security Breach',
        ownerId: secondUser.id,
        impact: 4,
        likelihood: 3,
        rating: 12,
        status: 'IN_PROGRESS' as const,
        notes: 'Vendor security assessments being conducted. Contract requirements being updated.',
        departmentId: itDept.id,
      },
      {
        title: 'Inadequate Security Awareness Among Staff',
        ownerId: secondUser.id,
        impact: 3,
        likelihood: 4,
        rating: 12,
        status: 'IN_PROGRESS' as const,
        notes: 'Annual training program rolled out. Phishing simulation exercises scheduled quarterly.',
        departmentId: hrDept.id,
      },
      {
        title: 'Failure to Detect Security Incidents',
        ownerId: mainUser.id,
        impact: 4,
        likelihood: 3,
        rating: 12,
        status: 'IN_PROGRESS' as const,
        notes: 'SIEM implementation in progress. 24/7 monitoring being established.',
        departmentId: itDept.id,
      },
    ];

    const createdRisks = [];
    for (const risk of risks) {
      const created = await prisma.risk.create({ data: risk });
      createdRisks.push(created);
    }
    console.log(`✅ Created ${createdRisks.length} risks`);

    // Link some controls to risks
    await prisma.control.update({
      where: { id: createdControls[0].id }, // MFA
      data: { riskId: createdRisks[0].id }, // Unauthorized Access
    });

    await prisma.control.update({
      where: { id: createdControls[1].id }, // Encryption
      data: { riskId: createdRisks[1].id }, // Data Breach
    });

    await prisma.control.update({
      where: { id: createdControls[4].id }, // Access Review
      data: { riskId: createdRisks[4].id }, // Insider Threat
    });

    // 4. SEED ASSESSMENTS
    console.log('📊 Creating sample assessments...');

    const assessments = [
      {
        title: 'MFA Implementation Assessment',
        description: 'Assess the effectiveness and coverage of multi-factor authentication implementation.',
        controlId: createdControls[0].id,
        assessorId: mainUser.id,
        status: 'COMPLETED' as const,
        result: 'PASSED' as const,
        score: 85,
        scheduledDate: new Date('2025-10-01'),
        completedDate: new Date('2025-10-15'),
        findings: 'MFA is implemented for 95% of users. Remaining 5% are service accounts being reviewed.',
        recommendations: 'Complete MFA rollout to service accounts. Implement monitoring for MFA bypass attempts.',
      },
      {
        title: 'Data Encryption Compliance Review',
        description: 'Verify that all sensitive data is encrypted at rest according to policy.',
        controlId: createdControls[1].id,
        assessorId: secondUser.id,
        status: 'COMPLETED' as const,
        result: 'PASSED' as const,
        score: 90,
        scheduledDate: new Date('2025-09-01'),
        completedDate: new Date('2025-09-15'),
        findings: 'All databases and file storage systems use AES-256 encryption. Key management procedures are robust.',
        recommendations: 'Continue current practices. Schedule next review in 6 months.',
      },
      {
        title: 'Security Awareness Training Effectiveness',
        description: 'Evaluate the completion and effectiveness of security awareness training program.',
        controlId: createdControls[2].id,
        assessorId: mainUser.id,
        status: 'COMPLETED' as const,
        result: 'PARTIALLY_COMPLIANT' as const,
        score: 75,
        scheduledDate: new Date('2025-08-01'),
        completedDate: new Date('2025-08-15'),
        findings: 'Training completion rate is 88%. Assessment pass rate is 92%. Some departments lag behind.',
        recommendations: 'Implement reminders for incomplete training. Consider more engaging training content.',
      },
      {
        title: 'Quarterly Vulnerability Scan Review - Q4',
        description: 'Review results of Q4 vulnerability scans and remediation status.',
        controlId: createdControls[3].id,
        assessorId: mainUser.id,
        status: 'IN_PROGRESS' as const,
        scheduledDate: new Date('2025-11-15'),
        findings: 'Scan completed. 12 critical, 45 high, 120 medium vulnerabilities identified.',
        recommendations: 'Prioritize critical and high vulnerabilities. Set 30-day remediation deadline.',
      },
      {
        title: 'Access Rights Review - November 2025',
        description: 'Monthly review of user access rights and privilege assignments.',
        controlId: createdControls[4].id,
        assessorId: secondUser.id,
        status: 'COMPLETED' as const,
        result: 'PASSED' as const,
        score: 70,
        scheduledDate: new Date('2025-11-01'),
        completedDate: new Date('2025-11-08'),
        findings: '12 access rights required revocation. 5 users had excessive privileges.',
        recommendations: 'Implement automated access review tools. Strengthen approval workflows.',
      },
      {
        title: 'Backup Recovery Test - November',
        description: 'Monthly test of backup restoration procedures for critical systems.',
        controlId: createdControls[5].id,
        assessorId: mainUser.id,
        status: 'COMPLETED' as const,
        result: 'PASSED' as const,
        score: 88,
        scheduledDate: new Date('2025-11-05'),
        completedDate: new Date('2025-11-06'),
        findings: 'All backups restored successfully within RTO. Average recovery time: 2.5 hours.',
        recommendations: 'Document lessons learned. Test disaster recovery site next month.',
      },
      {
        title: 'Privacy Impact Assessment - New CRM System',
        description: 'PIA for the new customer relationship management system implementation.',
        controlId: createdControls[6].id,
        assessorId: mainUser.id,
        status: 'SCHEDULED' as const,
        scheduledDate: new Date('2025-12-01'),
        findings: null,
        recommendations: null,
      },
    ];

    const createdAssessments = [];
    for (const assessment of assessments) {
      const created = await prisma.assessment.create({ data: assessment });
      createdAssessments.push(created);
    }
    console.log(`✅ Created ${createdAssessments.length} assessments`);

    // 5. SEED AUDITS
    console.log('🔍 Creating sample audits...');

    const audits = [
      {
        code: 'AUD-2025-001',
        title: 'ISO 27001 Compliance Audit',
        description: 'Comprehensive audit of information security management system against ISO 27001 requirements.',
        type: 'COMPLIANCE' as const,
        status: 'IN_PROGRESS' as const,
        scope: 'All IT systems, processes, and controls within the information security management system. Focus on Annexes A.5-A.18.',
        leadAuditorId: secondUser.id,
        departmentId: itDept.id,
        startDate: new Date('2025-11-01'),
        endDate: new Date('2025-12-15'),
        reportDate: new Date('2025-12-31'),
      },
      {
        code: 'AUD-2025-002',
        title: 'GDPR Data Protection Audit',
        description: 'Audit to verify compliance with GDPR requirements for personal data processing.',
        type: 'COMPLIANCE' as const,
        status: 'PLANNED' as const,
        scope: 'Review of data processing activities, consent mechanisms, data subject rights, breach notification procedures.',
        leadAuditorId: mainUser.id,
        departmentId: itDept.id,
        startDate: new Date('2025-12-01'),
        endDate: new Date('2026-01-31'),
      },
      {
        code: 'AUD-2025-003',
        title: 'Internal IT Controls Audit',
        description: 'Annual internal audit of IT general controls and application controls.',
        type: 'INTERNAL' as const,
        status: 'COMPLETED' as const,
        scope: 'Access controls, change management, IT operations, backup and recovery procedures.',
        leadAuditorId: mainUser.id,
        departmentId: itDept.id,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-10-15'),
        reportDate: new Date('2025-10-31'),
        conclusion: 'Overall IT controls are adequate with minor improvements needed in change management documentation and access review processes.',
      },
      {
        code: 'AUD-2025-004',
        title: 'Business Continuity Planning Audit',
        description: 'Review of business continuity and disaster recovery plans and procedures.',
        type: 'OPERATIONAL' as const,
        status: 'IN_PROGRESS' as const,
        scope: 'BCP documentation, recovery procedures, backup strategies, failover testing.',
        leadAuditorId: secondUser.id,
        departmentId: itDept.id,
        startDate: new Date('2025-11-15'),
        endDate: new Date('2025-12-30'),
      },
    ];

    const createdAudits = [];
    for (const audit of audits) {
      const created = await prisma.audit.create({ data: audit });
      createdAudits.push(created);
    }
    console.log(`✅ Created ${createdAudits.length} audits`);

    // 6. SEED AUDIT FINDINGS
    console.log('📝 Creating sample audit findings...');

    const findings = [
      {
        auditId: createdAudits[2].id, // Internal IT Controls Audit
        title: 'Insufficient Change Management Documentation',
        description: 'Review of change management records revealed that 15% of changes lacked proper approval documentation.',
        severity: 'MEDIUM' as const,
        status: 'IN_PROGRESS' as const,
        category: 'Change Management',
        recommendation: 'Implement automated change approval workflow system. Provide training to change managers on documentation requirements.',
        responsibleId: mainUser.id,
        dueDate: new Date('2025-12-31'),
        remediationPlan: 'New change management system to be implemented by December 15. Training sessions scheduled for all change managers.',
      },
      {
        auditId: createdAudits[2].id,
        title: 'Access Review Process Not Consistently Followed',
        description: 'Access reviews were not completed on schedule in 3 out of 12 months. Some reviews lacked evidence of completion.',
        severity: 'MEDIUM' as const,
        status: 'IN_PROGRESS' as const,
        category: 'Access Control',
        recommendation: 'Implement automated reminders for access reviews. Require digital sign-off with timestamp.',
        responsibleId: mainUser.id,
        dueDate: new Date('2025-12-15'),
        remediationPlan: 'Automated access review system with email reminders and audit trail being implemented.',
      },
      {
        auditId: createdAudits[0].id, // ISO 27001 Audit
        title: 'Incomplete Asset Inventory',
        description: 'Asset inventory is missing approximately 20% of network devices and does not include all software licenses.',
        severity: 'HIGH' as const,
        status: 'OPEN' as const,
        category: 'Asset Management',
        recommendation: 'Conduct comprehensive asset discovery scan. Implement automated asset management tool.',
        responsibleId: mainUser.id,
        dueDate: new Date('2025-12-20'),
        remediationPlan: 'Asset discovery tool procurement in progress. Manual inventory update underway.',
      },
      {
        auditId: createdAudits[0].id,
        title: 'Lack of Security Incident Response Testing',
        description: 'Security incident response plan has not been tested in the past 12 months. Team members unfamiliar with procedures.',
        severity: 'HIGH' as const,
        status: 'OPEN' as const,
        category: 'Incident Management',
        recommendation: 'Conduct tabletop exercise for incident response team. Schedule semi-annual testing.',
        responsibleId: secondUser.id,
        dueDate: new Date('2025-12-10'),
        remediationPlan: 'Tabletop exercise scheduled for December 5. Updated incident response procedures being distributed.',
      },
      {
        auditId: createdAudits[3].id, // BCP Audit
        title: 'Outdated Recovery Time Objectives',
        description: 'RTOs and RPOs documented in BCP are outdated and not aligned with current business requirements.',
        severity: 'MEDIUM' as const,
        status: 'OPEN' as const,
        category: 'Business Continuity',
        recommendation: 'Conduct business impact analysis with key stakeholders. Update RTOs and RPOs accordingly.',
        responsibleId: mainUser.id,
        dueDate: new Date('2026-01-15'),
      },
    ];

    const createdFindings = [];
    for (const finding of findings) {
      const created = await prisma.audit_finding.create({ data: finding });
      createdFindings.push(created);
    }
    console.log(`✅ Created ${createdFindings.length} audit findings`);

    // 7. SEED AUDIT SCHEDULES
    console.log('📅 Creating sample audit schedules...');

    const schedules = [
      {
        auditId: createdAudits[0].id, // ISO 27001 Audit
        title: 'Opening Meeting',
        description: 'Kick-off meeting with audit team and key stakeholders to discuss scope, timeline, and expectations.',
        scheduledDate: new Date('2025-11-01T09:00:00'),
        duration: 2,
        location: 'Conference Room A',
        attendees: JSON.stringify(['Lead Auditor', 'IT Manager', 'Security Manager', 'Compliance Officer']),
        status: 'COMPLETED' as const,
        notes: 'Meeting completed successfully. All stakeholders aligned on audit scope and timeline.',
      },
      {
        auditId: createdAudits[0].id,
        title: 'Access Control Review',
        description: 'Review of access control policies, procedures, and implementation.',
        scheduledDate: new Date('2025-11-10T10:00:00'),
        duration: 4,
        location: 'IT Department',
        attendees: JSON.stringify(['Lead Auditor', 'Security Team', 'IT Operations']),
        status: 'COMPLETED' as const,
        notes: 'Reviewed access logs, policy documents, and interviewed key personnel.',
      },
      {
        auditId: createdAudits[0].id,
        title: 'Data Protection Controls Review',
        description: 'Assessment of data encryption, backup, and data loss prevention controls.',
        scheduledDate: new Date('2025-11-15T09:00:00'),
        duration: 3,
        location: 'Data Center',
        attendees: JSON.stringify(['Lead Auditor', 'Database Administrators', 'Security Team']),
        status: 'COMPLETED' as const,
      },
      {
        auditId: createdAudits[0].id,
        title: 'Incident Management Review',
        description: 'Review of incident response procedures, logs, and recent incidents.',
        scheduledDate: new Date('2025-11-20T14:00:00'),
        duration: 3,
        location: 'Conference Room B',
        attendees: JSON.stringify(['Lead Auditor', 'Security Team', 'IT Manager']),
        status: 'IN_PROGRESS' as const,
      },
      {
        auditId: createdAudits[0].id,
        title: 'Closing Meeting',
        description: 'Present preliminary findings and recommendations to management.',
        scheduledDate: new Date('2025-12-15T10:00:00'),
        duration: 2,
        location: 'Executive Boardroom',
        attendees: JSON.stringify(['Lead Auditor', 'CIO', 'IT Manager', 'Compliance Officer', 'Department Heads']),
        status: 'SCHEDULED' as const,
      },
      {
        auditId: createdAudits[3].id, // BCP Audit
        title: 'BCP Documentation Review',
        description: 'Review of business continuity plan documents and procedures.',
        scheduledDate: new Date('2025-11-20T09:00:00'),
        duration: 4,
        location: 'Meeting Room 1',
        attendees: JSON.stringify(['Lead Auditor', 'BCP Coordinator', 'IT Operations']),
        status: 'IN_PROGRESS' as const,
      },
      {
        auditId: createdAudits[3].id,
        title: 'Backup and Recovery Testing Observation',
        description: 'Observe backup recovery test and evaluate procedures.',
        scheduledDate: new Date('2025-12-05T10:00:00'),
        duration: 6,
        location: 'DR Site',
        attendees: JSON.stringify(['Lead Auditor', 'IT Operations', 'System Administrators']),
        status: 'SCHEDULED' as const,
      },
    ];

    const createdSchedules = [];
    for (const schedule of schedules) {
      const created = await prisma.audit_schedule.create({ data: schedule });
      createdSchedules.push(created);
    }
    console.log(`✅ Created ${createdSchedules.length} audit schedules`);

    console.log('\n🎉 Sample data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Policies: ${createdPolicies.length}`);
    console.log(`   - Controls: ${createdControls.length}`);
    console.log(`   - Risks: ${createdRisks.length}`);
    console.log(`   - Assessments: ${createdAssessments.length}`);
    console.log(`   - Audits: ${createdAudits.length}`);
    console.log(`   - Audit Findings: ${createdFindings.length}`);
    console.log(`   - Audit Schedules: ${createdSchedules.length}`);

  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    throw error;
  }
}

// Run the seeding function
seedSampleData()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
