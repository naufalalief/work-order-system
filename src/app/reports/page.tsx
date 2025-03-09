"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Navbar from "../../components/ui/Navbar";
import {
  DecodedToken,
  OperatorReport,
  ProductReportItem,
} from "@/utils/interfaces";
import { ProductSummaryReport } from "./sections/ProductSummaryReport";
import { OperatorSummaryReport } from "./sections/OperatorSummaryReport";

const ReportsPage = () => {
  const [operatorReports, setOperatorReports] = useState<OperatorReport[]>([]);
  const [productReports, setProductReports] = useState<ProductReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to login first");
      router.push("/");
      return;
    }

    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      if (decodedToken && decodedToken.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedToken.exp > currentTime) {
          if (decodedToken.role !== "PRODUCTION_MANAGER") {
            router.push("/");
            return;
          }
          fetchReports(userRole as string);
        } else {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } else {
        localStorage.removeItem("token");
        router.push("/login");
      }
    } catch (err) {
      localStorage.removeItem("token");
      router.push("/login");
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
          <OperatorSummaryReport operatorReports={operatorReports} />
          <ProductSummaryReport productReports={productReports} />
        </div>
      </section>
    </>
  );
};

export default ReportsPage;
