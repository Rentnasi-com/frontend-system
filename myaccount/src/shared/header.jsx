import { Dropdown } from "flowbite-react"
import { CiUser } from "react-icons/ci";
import { FaBell } from "react-icons/fa";
import { Link } from "react-router-dom"

const Header = () => {
  const handleLogout = () => {
    localStorage.clear()
    window.location.href="http://localhost:5173"
  }
  return (
    <>
      <header className="shadow sticky top-0 z-30 bg-white px-16">
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
              <a href="/">Home</a>
            </li>
            <li className="p-1 rounded-lg">
              <Link to="/dashboard">
                Apps
              </Link>
            </li>
            <li className="p-1 rounded-lg">
              <Link to="">
                Profile Info
              </Link>
            </li>
            <li className="p-1"><a href="">Payment & Subscriptions</a></li>

          </ul>

          <div className="flex space-x-3">
            <div className="bg-gray-100 px-2 py-1 flex justify-center items-center rounded-xl">
              <FaBell />
            </div>

            <Dropdown className="w-32 divide" label="" dismissOnClick={false} renderTrigger={() => <span className="bg-gray-100 px-2 py-1 flex justify-center items-center rounded-xl"><CiUser className="text-red-700" /></span>}>
              <Dropdown.Item>Dashboard</Dropdown.Item>
              <Dropdown.Item>Settings</Dropdown.Item>
              <Dropdown.Item>Earnings</Dropdown.Item>
              <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
            </Dropdown>

          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
