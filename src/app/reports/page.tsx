"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../../components/ui/Navbar";
import { OperatorReport, ProductReportItem } from "@/utils/interfaces";
import { ProductSummaryReport } from "./sections/ProductSummaryReport";
import { OperatorSummaryReport } from "./sections/OperatorSummaryReport";
import { useAuthentication } from "@/hooks/useAuth";
import { useOperators } from "@/hooks/useOperator";
import { useReports } from "@/hooks/useReport";

const ReportsPage = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [assignedToId, setAssignedToId] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const isAuthenticated = useAuthentication({
    allowedRoles: ["PRODUCTION_MANAGER"],
    setUserRole,
    redirectTo: "/login",
  });

  const {
    operators,
    loading: operatorsLoading,
    error: operatorsError,
  } = useOperators(token, setAssignedToId);
  const {
    operatorReports,
    productReports,
    loading: reportsLoading,
    error: reportsError,
  } = useReports(token);

  if (!isAuthenticated) return null;

  if (operatorsLoading || reportsLoading) return <div>Loading reports...</div>;
  if (operatorsError || reportsError)
    return <div>Error: {operatorsError || reportsError}</div>;

  if (!operatorReports || !productReports)
    return <div>No reports available.</div>;

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
