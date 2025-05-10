import { CreditCardIcon, DocumentTextIcon, EnvelopeIcon, HomeIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const Aside = () => {
  return (
    <aside className="hidden md:w-64 border-r border-gray-200 fixed z-20 h-full top-0 left-0 pt-10 md:flex lg:flex flex-shrink-0 flex-col transition-width duration-75" aria-label="Sidebar">
      <div className="h-full py-4 overflow-y-auto">
        <Link
          to="/"
          className={`flex items-center w-full px-4 py-3 rounded-lg bg-indigo-50 text-indigo-700`}
        >
          <HomeIcon className="h-5 w-5 mr-3" />
          Overview
        </Link>
        <Link
          to="/dashboard/payments"
          className={`flex items-center w-full px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100`}
        >
          <CreditCardIcon
            className="h-5 w-5 mr-3" />
          Payments
        </Link>
        <Link
          to="/dashboard/maintenance"
          className={`flex items-center w-full px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100`}
        >
          <WrenchScrewdriverIcon className="h-5 w-5 mr-3" />
          Maintenance
        </Link>
        <Link
          to="/documents"
          className={`flex items-center w-full px-4 py-3 rounded-lg 00 text-gray-600 hover:bg-gray-100`}
        >
          <DocumentTextIcon className="h-5 w-5 mr-3" />
          Documents
        </Link>
        <Link
          to="/messages"
          className={`flex items-center w-full px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100`}
        >
          <EnvelopeIcon className="h-5 w-5 mr-3" />
          Messages
        </Link>
      </div>
      <div className="text-white text-center border rounded mx-5 p-2 mt-20 bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br">
        <div className="bg-red-700 mx-auto w-16 h-16 relative -mt-12 border-4 border-white rounded-full overflow-hidden flex justify-center items-center">
          <h6 className="text-xs text-white">Rentnasi</h6>
        </div>
        <h5 className="text-lg font-semibold">Upgrade to Pro</h5>
        <p className="text-xs mt-4">Get one month free when
          you subscribe to pro</p>
        <div className="mt-4 w-full bg-white rounded text-red-500 text-xs px-2 py-3 ">
          <Link className=" ">Subscribe Now</Link>
        </div>
      </div>
    </aside >
  );
};

export default Aside;
