const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendLoginOTP = async ({
  email,
  name,
  otp,
}) => {
  try {
    const { data, error } =
      await resend.emails.send({
        from: "YouTube Clone <onboarding@resend.dev>",
        to: email,

        subject: "Your Login Verification Code",

        html: `
        <div style="font-family:Arial;padding:20px">

          <h2>Login Verification</h2>

          <p>Hello ${name || "User"},</p>

          <p>
            Someone is trying to log in to your account
            from a new device or location.
          </p>

          <h3>Your OTP</h3>

          <div
            style="
              font-size:32px;
              font-weight:bold;
              letter-spacing:8px;
              color:#ff0000;
            "
          >
            ${otp}
          </div>

          <p>
            This OTP will expire in
            <strong>5 minutes</strong>.
          </p>

          <p>
            If this wasn't you, you can safely ignore
            this email.
          </p>

        </div>
        `,
      });

    if (error) {
      console.error("OTP Email Error:", error);
      return null;
    }

    console.log("OTP Email Sent:", data);

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports = sendLoginOTP;