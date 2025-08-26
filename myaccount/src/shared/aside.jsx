import { Link } from "react-router-dom"
import { Dropdown } from "flowbite-react"

const Aside = () => {

  return (
    <>
      <aside className="w-64 border-r border-gray-200 fixed z-20 h-full top-0 left-0 flex lg:flex flex-shrink-0 flex-col transition-width duration-75" aria-label="Sidebar">
        <div className="h-full overflow-y-auto">
          <ul className="space-y-2 text-sm">
            <li>
              <Link className="flex justify-center items-center" to="/dashboard">
                <img
                  className="h-20"
                  src="/assets/images/rentalpay.png"
                  alt="logo"
                />
              </Link>

              <Link to="/dashboard" className="flex items-center p-2 text-gray-700 rounded-lg bg-yellow-100 group">
                <svg className="w-5 h-5 text-yellow-500 transition duration-75 group-hover:text-yellow-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                  <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                  <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                </svg>
                <span className="ms-3">Home</span>
              </Link>
            </li>
            <li>
              <Link to="/view-apps" className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-yellow-100 group">
                <svg className="flex-shrink-0 w-5 h-5 text-yellow-500 transition duration-75 group-hover:text-yellow-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z" />
                </svg>

                <span className="flex-1 ms-3 whitespace-nowrap">Apps</span>
              </Link>
            </li>


            <hr />
            <li className="">
              <Link to="" className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-yellow-100 group">
                <svg className="flex-shrink-0 w-5 h-5 text-yellow-500 transition duration-75 group-hover:text-yellow-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 11.5h13m-13 0V18a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-6.5m-13 0V9a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v2.5M9 5h11a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-1" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Payments & Subscription</span>
              </Link>
            </li>
            <li className="">

              <Dropdown label="" dismissOnClick={false} renderTrigger={() => <div className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-yellow-100 group">
                <svg className="flex-shrink-0 w-5 h-5 text-yellow-500 transition duration-75 group-hover:text-yellow-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M17 10v1.126c.367.095.714.24 1.032.428l.796-.797 1.415 1.415-.797.796c.188.318.333.665.428 1.032H21v2h-1.126c-.095.367-.24.714-.428 1.032l.797.796-1.415 1.415-.796-.797a3.979 3.979 0 0 1-1.032.428V20h-2v-1.126a3.977 3.977 0 0 1-1.032-.428l-.796.797-1.415-1.415.797-.796A3.975 3.975 0 0 1 12.126 16H11v-2h1.126c.095-.367.24-.714.428-1.032l-.797-.796 1.415-1.415.796.797A3.977 3.977 0 0 1 15 11.126V10h2Zm.406 3.578.016.016c.354.358.574.85.578 1.392v.028a2 2 0 0 1-3.409 1.406l-.01-.012a2 2 0 0 1 2.826-2.83ZM5 8a4 4 0 1 1 7.938.703 7.029 7.029 0 0 0-3.235 3.235A4 4 0 0 1 5 8Zm4.29 5H7a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h6.101A6.979 6.979 0 0 1 9 15c0-.695.101-1.366.29-2Z" clipRule="evenodd" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Settings</span></div>}>
                <Dropdown.Item as={Link} to="/account-setting">
                  Profile Settings
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/organization-setting" >
                  Organization Settings
                </Dropdown.Item>
              </Dropdown>
            </li>
          </ul>
        </div>
      </aside>
    </>
  )
}

export default Aside