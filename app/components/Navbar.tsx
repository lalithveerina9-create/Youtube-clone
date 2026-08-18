"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Menu,
  Search,
  Bell,
  Upload,
  Sun,
  Moon,
} from "lucide-react";

import { useUser } from "@/lib/AuthContext";

export default function Navbar() {
  const {
    user,
    logout,
    handlegooglesignin,
    changeTheme,
  } = useUser();

  const router = useRouter();

  const [searchText, setSearchText] = useState("");

  // ==========================
  // SEARCH
  // ==========================
  const handleSearch = () => {
    if (!searchText.trim()) return;

    router.push(
      `/search?q=${encodeURIComponent(searchText.trim())}`
    );
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b bg-background text-foreground sticky top-0 z-50">

      {/* ===================== */}
      {/* LEFT */}
      {/* ===================== */}

      <div className="flex items-center gap-5">

        <Menu className="cursor-pointer" />

        <Link href="/">
          <h1 className="text-2xl font-bold text-red-600">
            YouTube Clone
          </h1>
        </Link>

      </div>


      {/* ===================== */}
      {/* SEARCH */}
      {/* ===================== */}

      <div className="flex w-[45%]">

        <Input
          placeholder="Search videos..."
          value={searchText}
          onChange={(e) =>
            setSearchText(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />

        <Button
          onClick={handleSearch}
          className="ml-2"
        >
          <Search className="w-4 h-4" />
        </Button>

      </div>


      {/* ===================== */}
      {/* RIGHT */}
      {/* ===================== */}

      <div className="flex items-center gap-5">

        {/* MANUAL THEME SWITCH */}

        {user && (
          <Button
            variant="outline"
            onClick={() =>
              changeTheme(
                user.theme === "dark"
                  ? "light"
                  : "dark"
              )
            }
            title={
              user.theme === "dark"
                ? "Switch to Light Mode"
                : "Switch to Dark Mode"
            }
          >

            {user.theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 mr-2" />
                Light
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </>
            )}

          </Button>
        )}


        {/* UPLOAD */}

        <Link href="/upload">

          <Button variant="outline">

            <Upload className="w-4 h-4 mr-2" />

            Upload

          </Button>

        </Link>


        {/* NOTIFICATIONS */}

        <Bell className="cursor-pointer" />


        {/* USER */}

        {user ? (
          <>

            <Link href="/profile">

              <img
                src={
                  user.image ||
                  "/avatar/default-avatar.png"
                }
                alt="User"
                className="w-10 h-10 rounded-full object-cover border cursor-pointer"
              />

            </Link>

            <span className="font-medium">
              {user.name}
            </span>

            <Button
              variant="outline"
              onClick={logout}
            >
              Logout
            </Button>

          </>
        ) : (

          <Button
            onClick={handlegooglesignin}
          >
            Login
          </Button>

        )}

      </div>

    </nav>
  );
}