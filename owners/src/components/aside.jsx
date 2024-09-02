import { Link } from "react-router-dom"

const Aside = () => {
  return (
    <>
        <aside className="w-64 border-r border-gray-200 fixed z-20 h-full top-0 left-0 pt-10 flex lg:flex flex-shrink-0 flex-col transition-width duration-75" aria-label="Sidebar">
            <div className="h-full py-4 overflow-y-auto">
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="#" className="flex items-center p-2 text-gray-700 rounded-lg bg-red-100 group">
                    <svg className="w-5 h-5 text-red-500 transition duration-75 group-hover:text-red-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                      <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                      <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                    </svg>
                    <span className="ms-3">Home</span>
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
    </>
  )
}

export default Aside