import { Outlet } from "react-router-dom"
import { Aside, Footer, Header } from "./shared"

const DashboardLayout = () => {
    return (
        <section>
            <Header />
            <div className="flex overflow-hidden bg-white">
                <div className="h-full w-full bg-gray-50 relative overflow-y-auto md:ml-64">
                    <Aside />
                    <Outlet />
                    <Footer />
                </div>
            </div>
        </section>
    )
}

export default DashboardLayout