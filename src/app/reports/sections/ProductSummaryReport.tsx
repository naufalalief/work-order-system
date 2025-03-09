import { ProductReportItem } from "@/utils/interfaces";

export const ProductSummaryReport = ({
  productReports,
}: {
  productReports: ProductReportItem[];
}) => {
  return (
    <div>
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
              <td className="border border-gray-300 p-2">{item.productName}</td>
              <td className="border border-gray-300 p-2">{item.PENDING}</td>
              <td className="border border-gray-300 p-2">{item.IN_PROGRESS}</td>
              <td className="border border-gray-300 p-2">{item.COMPLETED}</td>
              <td className="border border-gray-300 p-2">{item.CANCELED}</td>
              <td className="border border-gray-300 p-2">
                {item.totalQuantity}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
