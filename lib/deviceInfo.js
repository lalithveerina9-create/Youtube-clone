import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { UAParser } from "ua-parser-js";

export const getDeviceInfo = async () => {
  // Generate a stable device/browser fingerprint
  const fp = await FingerprintJS.load();
  const fingerprint = await fp.get();

  // Parse browser & operating system
  const parser = new UAParser();

  const browser = parser.getBrowser().name || "Unknown";
  const os = parser.getOS().name || "Unknown";

  let city = "Unknown";
  let state = "Unknown";

  try {
    const response = await fetch("https://ipapi.co/json/");
    const location = await response.json();

    city = location.city || "Unknown";
    state = location.region || "Unknown";
  } catch (error) {
    console.error("Location Error:", error);
  }

  return {
    deviceId: fingerprint.visitorId,
    browser,
    os,
    city,
    state,
  };
};