import { OperatorReport } from "@/utils/interfaces";

export const OperatorSummaryReport = ({
  operatorReports,
}: {
  operatorReports: OperatorReport[];
}) => {
  return (
    <div>
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
                <th className="border border-gray-300 p-2">Total Quantity</th>
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
    </div>
  );
};
