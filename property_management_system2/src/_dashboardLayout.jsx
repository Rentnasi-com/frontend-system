import { Outlet } from "react-router-dom"
import { Aside, Footer, Header } from "./shared"
import { useState } from "react"

const DashboardLayout = () => {
    const [collapsed, setCollapsed] = useState(false)

    return (
        <section className="h-screen flex flex-col">
            <Header />
            <div className="flex flex-1 bg-white relative overflow-hidden">
                {/* Sidebar */}
                <Aside collapsed={collapsed} setCollapsed={setCollapsed} />



                {/* Main content */}
                <main
                    className={`flex-1 h-full overflow-y-auto transition-all duration-300 bg-gray-100
                ${collapsed ? "ml-0 md:ml-16" : "ml-0 md:ml-64"}`}
                >
                    <Outlet />
                    <Footer />
                </main>
            </div>
        </section>
    )
}

export default DashboardLayout
