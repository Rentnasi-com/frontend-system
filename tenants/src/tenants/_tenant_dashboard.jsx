import { Outlet } from "react-router-dom"
import Header from "../components/header"
import Footer from "../components/footer"
import Aside from "../components/aside"

const DashboardLayout = () => {
    return (
        <>
            <section>
                <Header />
                <div className="flex overflow-hidden bg-white">
                    <div className="h-full w-full bg-gray-50 relative overflow-y-auto ml-64">
                        <Aside />
                        <Outlet />
                        <Footer />
                    </div>
                </div>
            </section>
        </>
    )
}

export default DashboardLayout