const nodemailer = require('nodemailer');
require('dotenv').config();

// Initialize transporter
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Helper function to format role names
const formatRole = (role) => {
  if (!role) return 'Reviewer';

  const roleMap = {
    organizationAuthority: 'Organization Authority',
    welfareOfficer: 'Welfare Officer',
    venueOwner: 'Venue Owner',
    categoryCheck: 'Category Check',
    securityUpload: 'Security Upload',
    proctor: 'Proctor',
    viceChancellor: 'Vice Chancellor',
    welfareFinal: 'Welfare Final',
    president: 'President',
    advisor: 'Advisor',
    dean: 'Dean',
  };

  return roleMap[role] || role.replace(/([A-Z])/g, ' $1').trim();
};

/**
 * Send approval request email to next reviewer
 */
const sendApprovalRequestEmail = async (
  reviewerEmail,
  reviewerName,
  eventTitle,
  eventDetails,
  reviewLink
) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0056b3; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
            .details-table { width: 100%; margin: 20px 0; border-collapse: collapse; }
            .details-table td { padding: 10px; border-bottom: 1px solid #ddd; }
            .details-table td:first-child { font-weight: bold; width: 30%; }
            .button { display: inline-block; padding: 12px 30px; background-color: #0056b3; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">📋 Event Approval Required</h2>
            </div>
            <div class="content">
              <p>Dear <strong>${reviewerName}</strong>,</p>
              
              <p>You have a new event awaiting your review and approval in the University Event Registration System.</p>
              
              <h3>Event Details:</h3>
              <table class="details-table">
                <tr>
                  <td>Event Title:</td>
                  <td>${eventTitle}</td>
                </tr>
                <tr>
                  <td>Event Date:</td>
                  <td>${eventDetails.eventDate}</td>
                </tr>
                <tr>
                  <td>Start Time:</td>
                  <td>${eventDetails.startTime}</td>
                </tr>
                <tr>
                  <td>End Time:</td>
                  <td>${eventDetails.endTime}</td>
                </tr>
                <tr>
                  <td>Venue:</td>
                  <td>${eventDetails.venueName}</td>
                </tr>
                <tr>
                  <td>Expected Attendees:</td>
                  <td>${eventDetails.expectedAttendees}</td>
                </tr>
                <tr>
                  <td>Current Stage:</td>
                  <td><strong>${formatRole(eventDetails.currentStage)}</strong></td>
                </tr>
              </table>
              
              <p>Please review the event details and provide your approval or feedback.</p>
              
              <a href="${reviewLink}" class="button">Review & Approve Event</a>
              
              <div class="footer">
                <p>If you have any questions, please contact the events team.</p>
                <p>University of Sri Jayewardenepura Events Team</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Event Approval Required

Dear ${reviewerName},

You have a new event awaiting your review and approval in the University Event Registration System.

Event Details:
- Event Title: ${eventTitle}
- Event Date: ${eventDetails.eventDate}
- Start Time: ${eventDetails.startTime}
- End Time: ${eventDetails.endTime}
- Venue: ${eventDetails.venueName}
- Expected Attendees: ${eventDetails.expectedAttendees}
- Current Stage: ${formatRole(eventDetails.currentStage)}

Please review the event details and provide your approval or feedback.

Review Event: ${reviewLink}

If you have any questions, please contact the events team.

University of Sri Jayewardenepura Events Team
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || process.env.SENDER_EMAIL || 'noreply@university.edu',
      to: reviewerEmail,
      subject: `[Action Required] Event Approval Needed: ${eventTitle}`,
      text: textContent.trim(),
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Approval request email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Error sending approval request email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send rejection email to event president
 */
const sendRejectionEmail = async (
  presidentEmail,
  presidentName,
  eventTitle,
  eventDetails,
  rejectionComment,
  editLink
) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
            .details-table { width: 100%; margin: 20px 0; border-collapse: collapse; }
            .details-table td { padding: 10px; border-bottom: 1px solid #ddd; }
            .details-table td:first-child { font-weight: bold; width: 30%; }
            .feedback-box { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 4px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #0056b3; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">⚠️ Event Requires Modifications</h2>
            </div>
            <div class="content">
              <p>Dear <strong>${presidentName}</strong>,</p>
              
              <p>Your event has been reviewed and requires modifications before it can be approved.</p>
              
              <h3>Event Details:</h3>
              <table class="details-table">
                <tr>
                  <td>Event Title:</td>
                  <td>${eventTitle}</td>
                </tr>
                <tr>
                  <td>Event Date:</td>
                  <td>${eventDetails.eventDate}</td>
                </tr>
                <tr>
                  <td>Venue:</td>
                  <td>${eventDetails.venueName}</td>
                </tr>
                <tr>
                  <td>Status:</td>
                  <td><strong style="color: #dc3545;">RETURNED FOR CHANGES</strong></td>
                </tr>
              </table>
              
              <div class="feedback-box">
                <h4 style="margin-top: 0;">Reviewer's Feedback:</h4>
                <p>${rejectionComment}</p>
              </div>
              
              <p>Please make the necessary changes to your event and resubmit it for approval.</p>
              
              <a href="${editLink}" class="button">Edit Your Event</a>
              
              <div class="footer">
                <p>If you have any questions, please contact the events team.</p>
                <p>University of Sri Jayewardenepura Events Team</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Event Requires Modifications

Dear ${presidentName},

Your event has been reviewed and requires modifications before it can be approved.

Event Details:
- Event Title: ${eventTitle}
- Event Date: ${eventDetails.eventDate}
- Venue: ${eventDetails.venueName}
- Status: RETURNED FOR CHANGES

Reviewer's Feedback:
${rejectionComment}

Please make the necessary changes to your event and resubmit it for approval.

Edit Event: ${editLink}

If you have any questions, please contact the events team.

University of Sri Jayewardenepura Events Team
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || process.env.SENDER_EMAIL || 'noreply@university.edu',
      to: presidentEmail,
      subject: `⚠️ Event Returned for Modifications: ${eventTitle}`,
      text: textContent.trim(),
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Rejection email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Error sending rejection email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send final approval email to event president
 */
const sendFinalApprovalEmail = async (
  presidentEmail,
  presidentName,
  eventTitle,
  eventDetails,
  eventLink
) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #28a745; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
            .success-box { background-color: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; border-radius: 4px; }
            .details-table { width: 100%; margin: 20px 0; border-collapse: collapse; }
            .details-table td { padding: 10px; border-bottom: 1px solid #ddd; }
            .details-table td:first-child { font-weight: bold; width: 30%; }
            .button { display: inline-block; padding: 12px 30px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">✓ Event Successfully Approved!</h2>
            </div>
            <div class="content">
              <p>Dear <strong>${presidentName}</strong>,</p>
              
              <p>Congratulations! Your event has been successfully approved and is now live in the system.</p>
              
              <div class="success-box">
                <p style="margin: 0;"><strong style="color: #155724;">Your event is now visible to all registered users and they can register for it.</strong></p>
              </div>
              
              <h3>Event Details:</h3>
              <table class="details-table">
                <tr>
                  <td>Event Title:</td>
                  <td>${eventTitle}</td>
                </tr>
                <tr>
                  <td>Event Date:</td>
                  <td>${eventDetails.eventDate}</td>
                </tr>
                <tr>
                  <td>Start Time:</td>
                  <td>${eventDetails.startTime}</td>
                </tr>
                <tr>
                  <td>End Time:</td>
                  <td>${eventDetails.endTime}</td>
                </tr>
                <tr>
                  <td>Venue:</td>
                  <td>${eventDetails.venueName}</td>
                </tr>
                <tr>
                  <td>Expected Attendees:</td>
                  <td>${eventDetails.expectedAttendees}</td>
                </tr>
                <tr>
                  <td>Status:</td>
                  <td><strong style="color: #28a745;">✓ FULLY APPROVED</strong></td>
                </tr>
              </table>
              
              <a href="${eventLink}" class="button">View Your Event</a>
              
              <p>You can track registrations and manage your event from the dashboard.</p>
              
              <div class="footer">
                <p>If you have any questions, please contact the events team.</p>
                <p>University of Sri Jayewardenepura Events Team</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Event Successfully Approved!

Dear ${presidentName},

Congratulations! Your event has been successfully approved and is now live in the system.

Event Details:
- Event Title: ${eventTitle}
- Event Date: ${eventDetails.eventDate}
- Start Time: ${eventDetails.startTime}
- End Time: ${eventDetails.endTime}
- Venue: ${eventDetails.venueName}
- Expected Attendees: ${eventDetails.expectedAttendees}
- Status: ✓ FULLY APPROVED

Your event is now visible to all registered users and they can register for it.

View Event: ${eventLink}

You can track registrations and manage your event from the dashboard.

If you have any questions, please contact the events team.

University of Sri Jayewardenepura Events Team
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || process.env.SENDER_EMAIL || 'noreply@university.edu',
      to: presidentEmail,
      subject: `✓ Event Approved: ${eventTitle}`,
      text: textContent.trim(),
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Final approval email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Error sending final approval email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Test SMTP connection
 */
const testSMTPConnection = async () => {
  try {
    await transporter.verify();
    console.log('✓ SMTP connection verified successfully');
    return { success: true };
  } catch (error) {
    console.error('✗ SMTP connection failed:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendApprovalRequestEmail,
  sendRejectionEmail,
  sendFinalApprovalEmail,
  testSMTPConnection,
  formatRole,
};
