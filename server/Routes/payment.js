const sendSubscriptionEmail = require("../utils/sendSubscriptionEmail");
const express = require("express");
const router = express.Router();

const Razorpay = require("razorpay");
const crypto = require("crypto");

const Payment = require("../Models/Payment");
const User = require("../Models/User");

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// ==========================================
// CREATE RAZORPAY ORDER
// ==========================================

router.post("/create-order", async (req, res) => {
  try {
    const { userId, plan } = req.body;

    // Validate User ID
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    // Validate Plan
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: "Plan is required.",
      });
    }

    // Check User
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Plan Prices
    const prices = {
      Free: 0,
      Bronze: 99,
      Silver: 199,
      Gold: 499,
    };

    const amount = prices[plan];

    if (amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Invalid Plan",
      });
    }

    // Razorpay amount is in paise
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    // Create Razorpay Order
    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      message: "Order created successfully.",
      order,
    });

  } catch (error) {
    console.error("Payment Route Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


// ==========================================
// VERIFY PAYMENT
// ==========================================

router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      userId,
      plan,
    } = req.body;

    // Verify Razorpay Signature
    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        razorpay_order_id +
        "|" +
        razorpay_payment_id
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment Verification Failed",
      });
    }

    // Determine Plan Amount
    const prices = {
      Free: 0,
      Bronze: 99,
      Silver: 199,
      Gold: 499,
    };

    const amount = prices[plan];

    if (amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Invalid Plan",
      });
    }

    // Save Payment in MongoDB
    const payment = new Payment({
      user: userId,
      plan: plan,
      amount: amount,
      transactionId: razorpay_payment_id,
      paymentStatus: "Success",
    });

    await payment.save();

    console.log("Payment saved successfully");


    // Update User Subscription Plan
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        userPlan: plan,
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log(
      "User plan updated:",
      updatedUser.userPlan
    );


    // Send Subscription Confirmation Email
    await sendSubscriptionEmail({
      email: updatedUser.email,
      name: updatedUser.name,
      plan: plan,
      amount: amount,
      transactionId: razorpay_payment_id,
    });

    console.log(
      "Subscription confirmation email processed for:",
      updatedUser.email
    );


    // Send Response to Frontend
    return res.status(200).json({
      success: true,
      message: "Payment Verified Successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error(
      "Payment Verification Error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


module.exports = router;