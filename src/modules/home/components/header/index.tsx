"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/api";
import { getToken, removeToken } from "@/utils/auth";
import { config } from "@/config";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getToken();
        const response = await fetch(`${config.apiUrl}/api/v1/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.status === "success") {
          setUser(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  return (
    <header className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-3 sm:py-4 gap-4 sm:gap-0">
          <div className="w-full sm:w-auto flex justify-center sm:justify-start">
            <h1 className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors cursor-pointer">
              File Management System
            </h1>
          </div>

          {user && (
            <div className="flex items-center gap-6 w-full sm:w-auto justify-center sm:justify-end">
              <div className="flex items-center">
                <div className="relative group">
                  <div className="absolute top-12 right-0 bg-white p-2 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <p className="text-sm text-gray-600 whitespace-nowrap">
                      Signed in as{" "}
                      <span className="font-medium">{user.name}</span>
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium bg-blue-500 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
