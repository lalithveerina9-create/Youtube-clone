"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
export default function VerifyOTPPage() {

  const router = useRouter();
const { login } = useUser();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {

    const pendingLogin = JSON.parse(
      localStorage.getItem("pendingLogin")
    );

    if (!pendingLogin) {
      alert("No pending login found.");
      return;
    }

    try {

      setLoading(true);

      const response = await axiosInstance.post(
        "/user/verify-login-otp",
        {
          email: pendingLogin.email,
          otp: otp,
          ...pendingLogin.deviceInfo,
        }
      );

     login(response.data.result);

localStorage.removeItem("pendingLogin");

router.push("/");
    } catch (error) {

      alert(
        error.response?.data?.message ||
        "OTP verification failed."
      );

    } finally {

      setLoading(false);

    }

  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
    >
      <div className="w-[400px] p-8 rounded-xl shadow-lg border">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Verify OTP
        </h1>

        <input
          type="text"
          maxLength={6}
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="border w-full p-3 rounded-lg mb-4"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="bg-red-600 text-white w-full p-3 rounded-lg"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

      </div>
    </div>
  );

}