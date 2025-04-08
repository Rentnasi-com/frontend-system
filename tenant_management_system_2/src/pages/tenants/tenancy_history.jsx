import { DashboardHeader, TableRow } from "../pages_components";

const TenancyHistory = () => {
  const properties = [
    {
      itemPaidFor: "Rent",
      amountPaid: "KES 10,000",
      fines: "KES 2,000",
      rowTotal: "KES 12,000",
      overdueDate: "20th May 2018",
      status: "Not Paid",
      datePaid: "20th May 2020",
      actions: "Pay Now",
      isShowingActions: true
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
                  <th className="px-4 py-2">Payment Date</th>
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Fines</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Overdue Date</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property, index) => (
                  <TableRow
                    key={index}
                    itemPaidFor={property.itemPaidFor}
                    amountPaid={property.amountPaid}
                    fines={property.fines}
                    rowTotal={property.rowTotal}
                    overdueDate={property.overdueDate}
                    status={property.status}
                    datePaid={property.datePaid}
                    actions={property.actions}
                    isShowingActions={property.isShowingActions}
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

export default TenancyHistory