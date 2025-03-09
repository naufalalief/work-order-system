import { DecodedToken } from "@/utils/interfaces";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";

export const useOperators = (
  token: string | null,
  setAssignedToId?: React.Dispatch<React.SetStateAction<string>>
) => {
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchOperatorsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setOperators(data.users);
          const decodedToken = jwtDecode<DecodedToken>(token);
          if (
            decodedToken.role === "OPERATOR" &&
            setAssignedToId &&
            decodedToken.userId
          ) {
            setAssignedToId(decodedToken.userId.toString());
          }
        } else {
          setError("Failed to fetch operators");
        }
      } catch (err) {
        setError("Error fetching operators");
      } finally {
        setLoading(false);
      }
    };

    fetchOperatorsData();
  }, [token, setAssignedToId]);

  return { operators, loading, error };
};
