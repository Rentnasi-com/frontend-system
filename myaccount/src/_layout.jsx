import { Outlet } from "react-router-dom"
import { Aside, Footer, Header } from "./shared"

const MainLayout = () => {
    return (
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
    )
}

export default MainLayout