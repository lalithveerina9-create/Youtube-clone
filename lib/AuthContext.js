"use client";

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import {
  useState,
  useEffect,
  useContext,
  createContext,
} from "react";

import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";
import { getDeviceInfo } from "./deviceInfo";

const UserContext = createContext();

export const UserProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  // ==========================
  // LOGIN
  // ==========================
  const login = (userdata) => {

    setUser(userdata);

    localStorage.setItem(
      "user",
      JSON.stringify(userdata)
    );

    if (userdata.theme === "dark") {

      document.documentElement.classList.add("dark");

    } else {

      document.documentElement.classList.remove("dark");

    }

  };

  // ==========================
  // CHANGE THEME
  // ==========================
  const changeTheme = async (newTheme) => {

    if (!user?._id) return;

    try {

      const response = await axiosInstance.put(
        "/user/theme",
        {
          userId: user._id,
          theme: newTheme,
        }
      );

      const updatedUser = response.data.result;

      setUser(updatedUser);

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      if (newTheme === "dark") {

        document.documentElement.classList.add("dark");

      } else {

        document.documentElement.classList.remove("dark");

      }

    } catch (error) {

      console.error(
        "Theme Update Error:",
        error
      );

    }

  };

  // ==========================
  // LOGOUT
  // ==========================
  const logout = async () => {

    setUser(null);

    localStorage.removeItem("user");

    document.documentElement.classList.remove("dark");

    try {

      await signOut(auth);

    } catch (error) {

      console.error(
        "Logout Error:",
        error
      );

    }

  };

  // ==========================
  // GOOGLE LOGIN
  // ==========================
  const handlegooglesignin = async () => {

    try {

      const result = await signInWithPopup(
        auth,
        provider
      );

      const firebaseuser = result.user;

      const deviceInfo = await getDeviceInfo();

      const payload = {

        email: firebaseuser.email,

        name: firebaseuser.displayName,

        image:
          firebaseuser.photoURL ||
          "https://github.com/shadcn.png",

        deviceId: deviceInfo.deviceId,

        browser: deviceInfo.browser,

        os: deviceInfo.os,

        city: deviceInfo.city,

        state: deviceInfo.state,

      };
const response = await axiosInstance.post(
  "/user/login",
  payload
);

console.log(response.data);

if (response.data.otpRequired) {

  localStorage.setItem(
    "pendingLogin",
    JSON.stringify({
      email: response.data.email,
      deviceInfo,
    })
  );

  window.location.href = "/verify-otp";

} else {

  login(response.data.result);

}

    } catch (error) {

      console.error(
        "Google Sign In Error:",
        error
      );

    }

  };
    // ==========================
  // FIREBASE AUTH LISTENER
  // ==========================
  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseuser) => {

        if (firebaseuser) {

          // Restore user from localStorage
          const savedUser = localStorage.getItem("user");

          if (savedUser) {

            const parsedUser = JSON.parse(savedUser);

            setUser(parsedUser);

            if (parsedUser.theme === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }

          }

        } else {

          setUser(null);

          localStorage.removeItem("user");

          document.documentElement.classList.remove("dark");

        }

      }
    );

    return () => unsubscribe();

  }, []);

  // ==========================
  // CONTEXT PROVIDER
  // ==========================
  return (

    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        handlegooglesignin,
        changeTheme,
      }}
    >

      {children}

    </UserContext.Provider>

  );

};

// ==========================
// CUSTOM USER HOOK
// ==========================
export const useUser = () => useContext(UserContext);