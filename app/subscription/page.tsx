"use client";

import Script from "next/script";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionPage() {
  const { user } = useUser();
console.log("Current User:", user);
  const plans = [
    {
      name: "Free",
      price: "₹0",
      features: [
        "1 Download / Day",
        "Standard Videos",
        "Ads Enabled",
      ],
    },
    {
      name: "Bronze",
      price: "₹99",
      features: [
        "10 Downloads / Day",
        "Premium Videos",
        "Ads Enabled",
      ],
    },
    {
      name: "Silver",
      price: "₹199",
      features: [
        "100 Downloads / Day",
        "Premium Videos",
        "Longer Watch Time",
      ],
    },
    {
      name: "Gold",
      price: "₹499",
      features: [
        "Unlimited Downloads",
        "Premium Videos",
        "Ad-Free Viewing",
      ],
    },
  ];

  const handleUpgrade = async (plan: any) => {
    if (!user?._id) {
      console.log("User not loaded");
      return;
    }

    try {
      const response = await axiosInstance.post(
        "/payment/create-order",
        {
          userId: user._id,
          plan: plan.name,
        }
      );
console.log("Create Order Response:", response.data);
      const { order } = response.data;

      console.log(
        "Key:",
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      );

      console.log("Razorpay:", window.Razorpay);

      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded.");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

        amount: order.amount,

        currency: order.currency,

        name: "YouTube Clone",

        description: `${plan.name} Subscription`,

        order_id: order.id,

        prefill: {
          name: user.name,
          email: user.email,
        },

        theme: {
          color: "#FF0000",
        },

       handler: async function (response: any) {
  console.log("Payment Success");
  console.log(response);

  try {
    const verifyResponse = await axiosInstance.post(
      "/payment/verify",
      {
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,

        userId: user._id,
        plan: plan.name,
      }
    );

    console.log("Verify Response:", verifyResponse.data);

    alert("Subscription Activated Successfully!");

  } catch (error: any) {

    console.error("Verification Error:", error);

    if (error.response) {
      console.log(error.response.data);
    }

    alert("Payment Verification Failed");
  }
},
      }
      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error: any) {
  console.error("Payment Error:", error);

  if (error.response) {
    console.log("Status:", error.response.status);
    console.log("Data:", error.response.data);
  }
}
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Subscription Plans
      </h1>

      <div className="grid grid-cols-1 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="border rounded-xl p-6 shadow hover:shadow-lg transition"
          >
            <h2 className="text-2xl font-bold">
              {plan.name}
            </h2>

            <p className="text-xl text-blue-600 my-4">
              {plan.price}
            </p>

            <div className="space-y-2">
              {plan.features.map((feature, index) => (
                <p
                  key={index}
                  className="text-gray-700"
                >
                  ✔ {feature}
                </p>
              ))}
            </div>

            <div className="mt-6">
              {plan.name === user?.userPlan ? (
                <button
                  className="w-full bg-gray-400 text-white py-2 rounded cursor-not-allowed"
                  disabled
                >
                  Current Plan
                </button>
              ) : (
                <button
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  onClick={() => handleUpgrade(plan)}
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
    </div>
  );
}