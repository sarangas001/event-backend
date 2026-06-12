#!/usr/bin/env node

require('dotenv').config();
const emailService = require('../../utils/emailService');

const runTests = async () => {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   Email Notification System Test Suite     ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // Check environment
  console.log('📋 Configuration Check:');
  console.log('  SMTP_USER:', process.env.SMTP_USER ? '✓ Set' : '✗ Not set');
  console.log('  SMTP_PASS:', process.env.SMTP_PASS ? '✓ Set' : '✗ Not set');
  console.log('  SMTP_FROM_EMAIL:', process.env.SMTP_FROM_EMAIL || process.env.SENDER_EMAIL || 'Not set');
  console.log();

  // Test SMTP connection
  console.log('🔌 Testing SMTP Connection...');
  const connectionTest = await emailService.testSMTPConnection();

  if (!connectionTest.success) {
    console.log('   ✗ Connection failed:', connectionTest.error);
    console.log('\n   Please verify:');
    console.log('   1. SMTP_USER and SMTP_PASS are correct in .env');
    console.log('   2. You have internet connectivity');
    console.log('   3. Brevo SMTP service is accessible');
    process.exit(1);
  }

  console.log('   ✓ SMTP connection successful\n');

  // Test approval request email
  console.log('📧 Testing Approval Request Email...');
  const approvalTest = await emailService.sendApprovalRequestEmail(
    process.env.TEST_EMAIL_TO || 'test@example.com',
    'Test Reviewer',
    'Test Event',
    {
      eventDate: '2024-12-25',
      startTime: '10:00 AM',
      endTime: '4:00 PM',
      venueName: 'Main Auditorium',
      expectedAttendees: 500,
      currentStage: 'welfareOfficer',
    },
    'https://example.com/approval-dashboard/event/123'
  );

  if (approvalTest.success) {
    console.log('   ✓ Email sent successfully');
    console.log('   Message ID:', approvalTest.messageId);
  } else {
    console.log('   ✗ Failed to send email:', approvalTest.error);
  }

  console.log();

  // Test rejection email
  console.log('📧 Testing Rejection Email...');
  const rejectionTest = await emailService.sendRejectionEmail(
    process.env.TEST_EMAIL_TO || 'test@example.com',
    'Test President',
    'Test Event',
    {
      eventDate: '2024-12-25',
      venueName: 'Main Auditorium',
    },
    'Please provide more details about security measures.',
    'https://example.com/events/123/edit'
  );

  if (rejectionTest.success) {
    console.log('   ✓ Email sent successfully');
    console.log('   Message ID:', rejectionTest.messageId);
  } else {
    console.log('   ✗ Failed to send email:', rejectionTest.error);
  }

  console.log();

  // Test final approval email
  console.log('📧 Testing Final Approval Email...');
  const finalApprovalTest = await emailService.sendFinalApprovalEmail(
    process.env.TEST_EMAIL_TO || 'test@example.com',
    'Test President',
    'Test Event',
    {
      eventDate: '2024-12-25',
      startTime: '10:00 AM',
      endTime: '4:00 PM',
      venueName: 'Main Auditorium',
      expectedAttendees: 500,
    },
    'https://example.com/events/123'
  );

  if (finalApprovalTest.success) {
    console.log('   ✓ Email sent successfully');
    console.log('   Message ID:', finalApprovalTest.messageId);
  } else {
    console.log('   ✗ Failed to send email:', finalApprovalTest.error);
  }

  console.log();
  console.log('╔════════════════════════════════════════════╗');
  console.log('║              Test Complete                 ║');
  console.log('╚════════════════════════════════════════════╝\n');

  const allSuccess = approvalTest.success && rejectionTest.success && finalApprovalTest.success;
  if (allSuccess) {
    console.log('✓ All email tests passed!');
    console.log('  Check your email (or the TEST_EMAIL_TO address) for the test emails.\n');
  } else {
    console.log('✗ Some email tests failed. Check errors above.\n');
  }
};

runTests().catch((error) => {
  console.error('Test error:', error);
  process.exit(1);
});
