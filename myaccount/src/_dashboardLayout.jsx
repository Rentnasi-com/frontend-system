import { Aside, Footer, Header } from "./shared"
import { Outlet } from "react-router-dom";

const MainLayout = () => {


  return (
    <>
      <div className="flex overflow-hidden bg-white">
        <div className="h-full w-full bg-gray-50 relative overflow-y-auto ml-64">
          <Aside />
          <Outlet />
          <Footer />
        </div>
      </div>
    </>
  )
}

export default MainLayout