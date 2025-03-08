"use client"; // Mark as Client Component
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import from next/navigation
import { jwtDecode, JwtPayload } from "jwt-decode";
import Navbar from "../components/shared/Navbar";

interface DecodedToken extends JwtPayload {
  role: string;
}

interface OperatorReport {
  operatorName: string;
  report: {
    productName: string;
    totalQuantity: number;
  }[];
}

interface ProductReportItem {
  productName: string;
  PENDING: number;
  IN_PROGRESS: number;
  COMPLETED: number;
  CANCELED: number;
  totalQuantity: number;
}

const ReportsPage = () => {
  const [operatorReports, setOperatorReports] = useState<OperatorReport[]>([]);
  const [productReports, setProductReports] = useState<ProductReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter(); // Use useRouter from next/navigation

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login"); // Redirect if no token
      return;
    }

    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      if (decodedToken && decodedToken.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedToken.exp > currentTime) {
          if (decodedToken.role !== "PRODUCTION_MANAGER") {
            router.push("/"); // Redirect if not authorized
            return;
          }
          fetchReports(userRole as string);
        } else {
          localStorage.removeItem("token");
          router.push("/login"); // Redirect if token expired
        }
      } else {
        localStorage.removeItem("token");
        router.push("/login"); // Redirect if invalid token
      }
    } catch (err) {
      localStorage.removeItem("token");
      router.push("/login"); // Redirect if decoding fails
    }
  }, [router]);

  const fetchReports = async (role: string | null) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Unauthorized");
        router.push("/");
        return;
      }
      const operatorRes = await fetch("/api/reports/operator-summary", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-User-Role": role || "",
        },
      });
      const productRes = await fetch("/api/reports/work-order-summary", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-User-Role": role || "",
        },
      });

      if (!operatorRes.ok || !productRes.ok) {
        throw new Error("Failed to fetch reports");
      }

      const operatorData = await operatorRes.json();
      const productData = await productRes.json();

      setOperatorReports(operatorData.reports);
      setProductReports(productData.report);
      setLoading(false);
    } catch (err) {
      setError("Failed to load reports.");
      setLoading(false);
      console.error("Error fetching reports:", err);
    }
  };

  if (loading) return <div>Loading reports...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <Navbar />
      <section className="container mx-auto p-8">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-4 cursor-pointer">Reports</h1>

          <h2>Operator Summary Reports</h2>
          {operatorReports.map((opReport) => (
            <div key={opReport.operatorName} className="mb-4">
              <h3 className="text-lg font-semibold mb-2">
                {opReport.operatorName}
              </h3>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2">Product Name</th>
                    <th className="border border-gray-300 p-2">
                      Total Quantity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {opReport.report.map((item) => (
                    <tr key={item.productName}>
                      <td className="border border-gray-300 p-2">
                        {item.productName}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {item.totalQuantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <h2>Product Summary Reports</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Product Name</th>
                <th className="border border-gray-300 p-2">Pending</th>
                <th className="border border-gray-300 p-2">In Progress</th>
                <th className="border border-gray-300 p-2">Completed</th>
                <th className="border border-gray-300 p-2">Canceled</th>
                <th className="border border-gray-300 p-2">Total Quantity</th>
              </tr>
            </thead>
            <tbody>
              {productReports.map((item) => (
                <tr key={item.productName}>
                  <td className="border border-gray-300 p-2">
                    {item.productName}
                  </td>
                  <td className="border border-gray-300 p-2">{item.PENDING}</td>
                  <td className="border border-gray-300 p-2">
                    {item.IN_PROGRESS}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {item.COMPLETED}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {item.CANCELED}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {item.totalQuantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default ReportsPage;
