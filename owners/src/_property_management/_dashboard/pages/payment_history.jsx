import { DashboardHeader, TableRow } from "./page_components"

const PaymentHistory = () => {
  const properties = [
    {
      item: "Rent",
      amount: "KES 10,000",
      fines: "KES 2,000",
      total: "KES 12,000",
      overdue_date: "20th May 2018",
      status: "Not Paid",
      payment_date: "20th May 2020",
      actions: "Pay Now",
      isShowing: false
    },
  ];
  return (
    <>
      <DashboardHeader
        title="B14 Payment breakdown"
        description="Connect and Thrive: Engage with Your Tenants Now!"
      />
      <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5">
        <h4 className="text-md text-gray-600 my-4 px-2">May - monthly breakdown</h4>
        <div className="w-full">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100 text-left text-xs">
                <tr>
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Fines</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Overdue Date</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Payment Date</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property, index) => (
                  <TableRow
                    key={index}
                    item={property.item}
                    amount={property.amount}
                    fines={property.fines}
                    total={property.total}
                    overdue_date={property.overdue_date}
                    status={property.status}
                    payment_date={property.payment_date}
                    actions={property.actions}
                    isShowing={false}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

export default PaymentHistory