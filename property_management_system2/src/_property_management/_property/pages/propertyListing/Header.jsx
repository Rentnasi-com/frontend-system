import { SlCalender } from "react-icons/sl";
import ExportIcon from "./ExportIcon";

const Header = () => (
  <div className="p-4 flex justify-between">
    <div>
      <h1 className="text-xl font-bold text-gray-700">Property Listing</h1>
      <p className="text-sm text-gray-500">
        Real-time information and activities of your property.
      </p>
    </div>

    <div className="flex space-x-4">
      <div className="bg-white p-2 rounded-xl shadow">
        <p className="text-xs text-gray-600 flex space-x-2 text-center">
          <SlCalender /> <span>March 27 2024 - January 25 2025</span>
        </p>
      </div>
      <div className="bg-white p-2 rounded-xl shadow">
        <div className="text-xs text-gray-600 flex space-x-2 text-center">
          <p>Export</p>
          <ExportIcon />
        </div>
      </div>
    </div>
  </div>
);

export default Header