const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendSubscriptionEmail = async ({
  email,
  name,
  plan,
  amount,
  transactionId,
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "YouTube Clone <onboarding@resend.dev>",
      to: email,

      subject: `${plan} Subscription Activated Successfully`,

      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Subscription Activated Successfully 🎉</h2>

          <p>Hello ${name || "User"},</p>

          <p>
            Your <strong>${plan}</strong> subscription has been
            activated successfully.
          </p>

          <h3>Payment Details</h3>

          <p><strong>Plan:</strong> ${plan}</p>
          <p><strong>Amount:</strong> ₹${amount}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Payment Status:</strong> Success</p>

          <br />

          <p>
            Thank you for subscribing to YouTube Clone.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Email Error:", error);
      return null;
    }

    console.log("Confirmation Email Sent:", data);

    return data;
  } catch (error) {
    console.error("Email Sending Error:", error);
    return null;
  }
};

module.exports = sendSubscriptionEmail;