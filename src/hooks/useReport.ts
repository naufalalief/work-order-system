import { useState, useEffect } from "react";

export const useReports = (token: string | null) => {
  const [operatorReports, setOperatorReports] = useState<any>(null);
  const [productReports, setProductReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchReportsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const operatorRes = await fetch("/api/reports/operator-summary", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const productRes = await fetch("/api/reports/work-order-summary", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!operatorRes.ok || !productRes.ok) {
          throw new Error("Failed to fetch reports");
        }

        const operatorData = await operatorRes.json();
        const productData = await productRes.json();

        setOperatorReports(operatorData.reports);
        setProductReports(productData.report);
      } catch (err) {
        setError("Error fetching reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, [token]);

  return { operatorReports, productReports, loading, error };
};
