class WelcomeRegi{

    welcomeRegi = null;

    constructor() {
        if(this.welcomeRegi != null) {
            this.welcomeRegi = new WelcomeRegi()
        }
        return this.welcomeRegi;
    }

    getTextBody = (name) => {
        return `Hi ${name},

        Thank you for registering at the University of Sri Jayewardenepura Events Portal.

        Your account has been successfully created. You can now:
        - Browse and register for upcoming events
        - Manage your event registrations
        - Receive important updates and reminders

        Login here: '127.0.0.1'

        If you didn’t sign up for this account, please ignore this email.

        Best regards,
        University of Sri Jayewardenepura
        Events Team`
    }

    getHtml = (name) => {
        return `
        <h2 style="color: #0056b3;">Welcome to University of Sri Jayewardenepura 🎉</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for registering at the <strong>University of Sri Jayewardenepura Events Portal</strong>.</p>
        <p>Your account has been successfully created. You can now:</p>
        <ul>
            <li>Browse and register for upcoming events</li>
            <li>Manage your event registrations</li>
            <li>Receive important updates and reminders</li>
        </ul>
        <p><a href='127.0.0.1' style="display:inline-block;padding:10px 15px;background:#0056b3;color:#fff;text-decoration:none;border-radius:5px;">Login to Your Account</a></p>
        <p>If you didn’t sign up for this account, please ignore this email.</p>
        <p>Welcome aboard,<br><strong>University of Sri Jayewardenepura Events Team</strong></p>
        `
    } 

}

const welcomeRegi = new WelcomeRegi();

module.exports = welcomeRegi;