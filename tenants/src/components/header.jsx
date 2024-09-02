import { CiUser } from "react-icons/ci";
import { FaBell } from "react-icons/fa";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <>
      <header className="shadow sticky top-0 z-30 bg-white">
        <nav className="mx-auto container py-2 flex justify-between">
          <Link to="/">
            <img
              className="w-[72px] h-[34px]"
              src="/assets/images/rentnasi.png"
              alt="logo"
            />
          </Link>

          {/* Tabs */}
          <ul className="flex space-x-5 rounded-xl bg-gray-100 px-4 py-1 text-xs">
            <li className="bg-white py-1 px-3 border border-gray-800 rounded">
              Home
            </li>
            
          </ul>

          <div className="flex space-x-3">
            <div className="bg-gray-100 px-2 py-1 flex justify-center items-center rounded-xl">
              <FaBell />
            </div>
            <div className="bg-gray-100 px-2 py-1 flex justify-center items-center rounded-xl">
              <CiUser className="text-red-700" />
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
