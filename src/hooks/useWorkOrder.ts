import { useState, useEffect, useCallback } from "react";

export const useWorkOrders = (token: string | null) => {
  const [workOrders, setWorkOrders] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkOrdersData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/work-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setWorkOrders(data.data);
      } else {
        setError("Failed to fetch work orders");
      }
    } catch (err) {
      setError("Error fetching work orders");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchWorkOrdersData();
  }, [token, fetchWorkOrdersData]);

  const refresh = useCallback(() => {
    if (token) {
      fetchWorkOrdersData();
    }
  }, [token, fetchWorkOrdersData]);

  return { workOrders, loading, error, refresh };
};
