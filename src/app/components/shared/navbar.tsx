"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { jwtDecode, JwtPayload } from "jwt-decode";
import Link from "next/link";
import { CustomJwtPayload } from "@/utils/interfaces";
import { UserInfo } from "@/utils/interfaces";
const Navbar = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    username: null,
    role: null,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setLoading(false);
    updateUserInfo();
  }, [pathname]);

  const updateUserInfo = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token) as CustomJwtPayload;
        if (decoded) {
          setUserInfo({
            username: decoded.username,
            role: decoded.role,
          });
        } else {
          setUserInfo({ username: null, role: null });
        }
      } catch (error) {
        console.error("Token decoding error:", error);
        setUserInfo({ username: null, role: null });
      }
    } else {
      setUserInfo({ username: null, role: null });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const formatRole = (role: string | null): string => {
    if (!role) return "";
    const lowerCaseRole = role.toLowerCase();
    const spacedRole = lowerCaseRole.replace(/_/g, " ");
    const capitalizedRole = spacedRole.replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
    return capitalizedRole;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="bg-gray-800 text-white w-full">
      <nav className="flex justify-between items-center p-4 max-w-5xl mx-auto">
        <ul className="flex space-x-4">
          <li>
            <Link href={"/work-orders"}>Orders</Link>
          </li>
          <li>
            <Link href={"/reports"}>Report</Link>
          </li>
        </ul>
        <div className="relative flex space-x-4 items-center text-black">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"}>
                <HamburgerMenuIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {userInfo.username ? (
                <>
                  <DropdownMenuLabel className="capitalize">
                    {userInfo.username} | {formatRole(userInfo.role)}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuLabel>Guest</DropdownMenuLabel>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </section>
  );
};

export default Navbar;
