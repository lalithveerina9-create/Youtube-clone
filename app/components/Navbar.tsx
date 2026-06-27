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
} from "lucide-react";

import { useUser } from "@/lib/AuthContext";

export default function Navbar() {

  const {
    user,
    logout,
    handlegooglesignin,
  } = useUser();

  const router = useRouter();

  const [searchText, setSearchText] =
    useState("");

  const handleSearch = () => {

    if (!searchText.trim()) return;

    router.push(`/search?q=${searchText}`);
  };

  return (

    <nav className="flex justify-between items-center px-6 py-4 border-b bg-white sticky top-0 z-50">

      {/* Left */}

      <div className="flex items-center gap-5">

        <Menu className="cursor-pointer" />

        <Link href="/">
          <h1 className="text-2xl font-bold text-red-600">
            YouTube Clone
          </h1>
        </Link>

      </div>

      {/* Search */}

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

      {/* Right */}

      <div className="flex items-center gap-5">

        <Link href="/upload">

          <Button variant="outline">

            <Upload className="w-4 h-4 mr-2" />

            Upload

          </Button>

        </Link>

        <Bell className="cursor-pointer" />

        {user ? (

          <>

            <img
              src={
                user.image ||
                "/avatar/default-avatar.png"
              }
              alt="User"
              className="w-10 h-10 rounded-full object-cover border"
            />

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