// useAuth.ts
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";

interface DecodedToken extends JwtPayload {
  role: string;
  userId?: number;
}

interface UseAuthenticationOptions {
  redirectTo?: string;
  allowedRoles?: string[];
  setUserRole?: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useAuthentication = ({
  redirectTo = "/",
  allowedRoles = [],
  setUserRole,
}: UseAuthenticationOptions = {}) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRoleState] = useState<string | null>(null); // Add userRole state

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        if (decodedToken && decodedToken.exp) {
          const currentTime = Math.floor(Date.now() / 1000);
          if (decodedToken.exp > currentTime) {
            if (
              allowedRoles.length > 0 &&
              !allowedRoles.includes(decodedToken.role)
            ) {
              router.push(redirectTo);
            } else {
              setUserRoleState(decodedToken.role); // Set userRole state
              setIsAuthenticated(true);
            }
          } else {
            localStorage.removeItem("token");
            router.push(redirectTo);
          }
        } else {
          localStorage.removeItem("token");
          router.push(redirectTo);
        }
      } catch (error) {
        localStorage.removeItem("token");
        router.push(redirectTo);
      }
    } else {
      router.push(redirectTo);
    }
  }, [router, allowedRoles, redirectTo]);

  return { isAuthenticated, userRole }; // Return isAuthenticated and userRole
};
