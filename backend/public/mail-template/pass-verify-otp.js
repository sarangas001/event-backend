const verifyPassOtpMail = {

    getSubject: "Password Reset OTP",

    getHtml: function(name,otp) {
        const html = `<body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px;">
      <tr>
        <td style="text-align: center;">
          <h2 style="color: #0056b3; margin-bottom: 10px;">Account Verification</h2>
          <p style="font-size: 16px; color: #333;">
            Dear ${name},<br>
            Use the following One-Time OTP to  change password :
          </p>
          <p style="font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #222; background: #f1f1f1; padding: 10px 20px; display: inline-block; border-radius: 6px;">
            ${otp}
          </p>
          <p style="font-size: 14px; color: #555; margin-top: 20px;">
            This OTP is valid for <strong>1 day</strong>. Do not share it with anyone for security reasons.
          </p>
          <p style="font-size: 14px; color: #777; margin-top: 30px;">
            Regards,<br>
            <strong>University of Sri Jayewardenepura<br>Events Team</strong>
          </p>
        </td>
      </tr>
    </table>
  </body>`

  return html
    }    
}

module.exports = verifyPassOtpMail;