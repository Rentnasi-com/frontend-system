const PropertyTable = ({
  properties,
  formatCurrency,
  handleViewProperty,
  currentPage,
}) => (
  <div className="relative overflow-x-auto shadow-md sm:rounded-lg mx-4 rounded-lg">
    <div className="flex justify-between p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white">
      <div>
        <select
          id="entries"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-14 p-1"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="30">30</option>
          <option value="40">40</option>
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <p className="text-sm text-gray-700">Show </p>
        <select
          id="showEntries"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-14 p-1"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="30">30</option>
          <option value="40">40</option>
        </select>
        <p className="text-sm text-gray-700">
          Entries 1 - {properties.length} of {properties.length * currentPage}
        </p>
      </div>
    </div>
    <div className="overflow-hidden border border-gray-200 rounded mt-3">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-200">
          <tr>
            <th scope="col" className="px-3 py-3">
              Photo
            </th>
            <th scope="col" className="px-1 py-3">
              Property Info
            </th>
            <th scope="col" className="px-1 py-3">
              Vacant Units
            </th>
            <th scope="col" className="px-1 py-3">
              Occupied Units
            </th>
            <th scope="col" className="px-1 py-3">
              Open Issues
            </th>
            <th scope="col" className="px-1 py-3">
              Expected Revenue
            </th>
            <th scope="col" className="px-1 py-3">
              Outstanding Revenue
            </th>
            <th scope="col" className="px-1 py-3">
              Pending Balances
            </th>
            <th scope="col" className="px-3 py-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <tr key={property.id} className="bg-white divide-y divide-gray-200">
              <td className="px-2 py-4">
                <img
                  src={
                    property.cover_image ||
                    "https://static.thenounproject.com/png/123924-200.png"
                  }
                  alt="Property"
                  className="w-12 h-12 rounded-full"
                />
              </td>
              <td className="px-2 py-4">
                <div className="font-semibold text-black">
                  {property.property_name}
                </div>
                <div className="text-sm text-gray-500">
                  {property.property_location}
                </div>
                <div className="flex space-x-10">
                  <div className="mt-1">
                    <p>Total Floors</p>
                    <p className="font-semibold text-black">
                      {property.total_floors}
                    </p>
                  </div>
                  <div className="mt-1">
                    <p>Total Units</p>
                    <p className="font-semibold text-black">
                      {property.total_units}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-2 py-4">{property.vacant_units}</td>
              <td className="px-2 py-4">{property.occupied_units}</td>
              <td className="py-4">
                <div className="text-center align-baseline inline-flex px-2 py-1 items-center text-success border border-red-900 bg-red-200 rounded">
                  <div className="bg-red-800 border border-red-600 rounded-full w-2 h-2 mr-1"></div>
                  <p className="font-semibold text-red-800">
                    {property.open_issues}
                  </p>
                </div>
              </td>
              <td className="py-4">
                <p className="text-center border border-green-700 align-baseline inline-flex px-2 py-1 items-center text-green-700 bg-green-200 rounded font-semibold">
                  {formatCurrency(property.expected_revenue)}
                </p>
              </td>
              <td className="py-4">
                <p className="text-center border border-blue-700 align-baseline inline-flex px-2 py-1 items-center text-blue-700 bg-blue-200 rounded font-semibold">
                  {formatCurrency(property.outstanding_revenue)}
                </p>
              </td>
              <td className="py-4">
                <p className="text-center border border-red-700 align-baseline inline-flex px-2 py-1 items-center text-success bg-red-200 rounded font-semibold">
                  {formatCurrency(property.pending_balance)}
                </p>
              </td>
              <td className="text-center">
                <button
                  onClick={() => handleViewProperty(property.id)}
                  className="text-gray-600 bg-gray-300 hover:text-gray-800 flex justify-center items-center h-[25px] w-[25px] text-base font-medium leading-normal text-center align-middle cursor-pointer rounded-2xl transition-colors duration-200 ease-in-out shadow-none border-0"
                >
                  <span className="flex items-center justify-center p-0 m-0 leading-none shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default PropertyTable