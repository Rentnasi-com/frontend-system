import { Link, useLocation } from "react-router-dom";
import { DashboardHeader } from "./pages/page_components"
import { Bar } from 'react-chartjs-2';
import { useEffect, useState } from "react";
import axios from "axios";

const Tabs = ({ name, url, isActive, onClick }) => {
    return (
        <div>
            <Link to={url} onClick={onClick} className={`${isActive ? 'border-b-2 border-black' : ''}`}>
                {name}
            </Link>
        </div >
    )
}

const RevenueCard = ({ value, name, percentage, color, textColor, borderColor, background }) => {
    return (
        <div className="border p-2 rounded" style={{ borderColor: `${color}` }}>
            <div className="flex justify-between items-center">
                <h6 className="text-gray-600 font-semibold text-sm">{name}</h6>
                <h6 className="text-gray-600 font-semibold">{value}</h6>
                <svg width="4" height="9" viewBox="0 0 4 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.0839844 8.04195V0.958618L3.62565 4.50028L0.0839844 8.04195Z" fill="#CB0101" />
                </svg>
            </div>
            <div className="flex justify-between mt-2">

                {/* <div className="flex items-center p-0.5 rounded space-x-2 border" style={{ borderColor: `${borderColor}`, background: `${background}` }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="2" width="4" height="4" rx="2" fill={`${textColor}`} />
                        <rect x="0.5" y="0.5" width="7" height="7" rx="3.5" stroke={`${textColor}`} />
                    </svg>
                    <p className="text-sm font-bold" style={{ color: `${textColor}` }}>{percentage}</p>
                </div> */}
            </div>
        </div>
    )
}

const Home2 = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL
    const [activeTab, setActiveTab] = useState(0)
    const [activeDuration, setActiveDuration] = useState(0)
    const [propertiesSummary, setPropertiesSummary] = useState([])
    const [incomeSummary, setIncomeSummary] = useState([])
    const token = localStorage.getItem("token")
    const [propertyCardStats, setPropertyCardStats] = useState([])
    const [inquiries, setInquiries] = useState([])
    const [dueDate, setDueDate] = useState([])
    const [barGraph, setBarGraph] = useState([])

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const duration = queryParams.get('duration') || 'month';
    const unitInfo = queryParams.get('unit_info') || 'overview';

    const tabsData = [
        {
            url: "/dashboard?unit_info=overview",
            name: "Overview",
            clicked: false
        },
        {
            url: "/dashboard?unit_info=occupied",
            name: "Occupied",
            clicked: false
        },
        {
            url: "/dashboard?unit_info=vacant",
            name: "Vacant",
            clicked: false
        },
        {
            url: "/dashboard?unit_info=published",
            name: "Published",
            clicked: false
        },
        {
            url: "/dashboard?unit_info=un_published",
            name: "Not Published",
            clicked: false
        },
    ]

    const durationData = [
        {
            url: "/dashboard?duration=month",
            name: "Month",
        },
        {
            url: "/dashboard?duration=year",
            name: "Year",
        },
    ]

    const fetchPropertiesSummary = async () => {
        try {
            const res = await axios.get(`${baseUrl}/dashboard/data-summary`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    }
                }
            )
            if (res.data.success) {
                setPropertiesSummary(res.data.result.units_summary)
                setIncomeSummary(res.data.result.income_summary)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const fetchPropertiesInquiries = async () => {
        try {
            const res = await axios.get(`${baseUrl}/dashboard/recent-inquiries`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    }
                }
            )
            if (res.data.success) {
                setInquiries(res.data.results)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const fetchCardItems = async () => {
        try {
            const res = await axios.get(`${baseUrl}/dashboard/statistics?unit_info=${unitInfo}&duration=${duration}&months=6`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    }
                }
            )
            if (res.data.success) {
                setPropertyCardStats(res.data.results.stats.data)
                setBarGraph(res.data.results.graph.data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const fetchDueDate = async () => {
        try {
            const res = await axios.get(`${baseUrl}/dashboard/due-rent`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    }
                }
            )
            if (res.data.success) {
                setDueDate(res.data.results)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const cardItems = [
        {
            name: "Expected",
            value: `Ksh ${propertyCardStats.expected || "0"}`,
            percentage: "10%",
            color: "#604AE3",
            textColor: "#089964",
            borderColor: "#089964",
            background: "#DFF2EB"
        },
        {
            name: "Received",
            value: `Ksh ${propertyCardStats.received || "0"}`,
            percentage: "4.6%",
            color: "#089964",
            textColor: "#089964",
            borderColor: "#089964",
            background: "#DFF2EB"
        },
        {
            name: "Balance",
            value: `Ksh ${propertyCardStats.balance || "0"}`,
            percentage: "4.8%",
            color: "#CB0101",
            textColor: "#CB0101",
            borderColor: "#CB0101",
            background: "#FAE8E8"
        },
    ]

    useEffect(() => {
        fetchPropertiesSummary()
        fetchPropertiesInquiries()
        fetchCardItems()
        fetchDueDate()
    }, [baseUrl, token, duration, unitInfo])

    const amounts = barGraph.map(item => item.amount)
    const months = barGraph.map(item => item.month + " - " + item.year)

    const data = {
        labels: months,
        datasets: [{
            label: 'Revenue',
            data: amounts,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 0.5,
            barThickness: 10
        }]
    };
    return (
        <section>
            <DashboardHeader
                title="Dashboard"
                description="Welcome to RentNasi Property Management Platform"
                name="New property"
                link="/add-property/general-information"
                hideSelect={false}
                hideLink={true}
                showLink2={true}
                link2Name="Receive Payment"
                link2="/property/receive-payment"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mx-4">
                <div className="md:col-span-2 border rounded bg-white p-3">
                    <div className="md:flex md:justify-between mb-5">
                        <div>
                            <h2 className="font-semibold text-gray-700">Property Revenue Overview</h2>
                            <p className="text-sm">Show overview <span className="text-gray-800 font-bold">Jan 2024 - Sept 2024</span> <span className="text-red-500">Detailed Stats</span></p>

                            <div className="hidden mt-4 md:flex space-x-2 text-gray-500 text-xs md:text-medium">
                                {tabsData.map((tab, index,) => (
                                    <Tabs
                                        key={index}
                                        url={tab.url}
                                        name={tab.name}
                                        isActive={activeTab === index}
                                        onClick={() => setActiveTab(index)}
                                    />
                                ))}
                            </div>
                            <hr />
                        </div>
                        <div>
                            <Link to="" className="flex bg-[#EBECF6] text-[#604AE3] border border-[#A59BEC] p-2 rounded text-xs">
                                <img className="mr-2" width={19} height={19} src="../../../assets/icons/png/download.png" alt="" />
                                Download Report
                            </Link>
                            <div className="hidden mt-6 md:flex space-x-2 text-gray-500 text-xs md:text-medium">
                                {durationData.map((duration, index,) => (
                                    <Tabs
                                        key={index}
                                        url={duration.url}
                                        name={duration.name}
                                        isActive={activeDuration === index}
                                        onClick={() => setActiveDuration(index)}
                                    />
                                ))}
                            </div>
                            <hr />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                            <div className="md:hidden mt-4 flex space-x-2 text-gray-500 text-xs md:text-medium">
                                {tabsData.map((tab, index,) => (
                                    <Tabs
                                        key={index}
                                        url={tab.url}
                                        name={tab.name}
                                        isActive={activeTab === index}
                                        onClick={() => setActiveTab(index)}
                                    />
                                ))}
                            </div>
                            <Bar data={data} />
                        </div>
                        <div className="md:hidden mt-6 flex space-x-2 text-gray-500 text-xs md:text-medium">
                            {durationData.map((duration, index,) => (
                                <Tabs
                                    key={index}
                                    url={duration.url}
                                    name={duration.name}
                                    isActive={activeDuration === index}
                                    onClick={() => setActiveDuration(index)}
                                />
                            ))}
                        </div>
                        <div className="space-y-3">
                            {cardItems.map((item, index) => (
                                <RevenueCard
                                    key={index}
                                    value={item.value}
                                    name={item.name}
                                    percentage={item.percentage}
                                    color={item.color}
                                    textColor={item.textColor}
                                    background={item.background}
                                    borderColor={item.borderColor}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="border rounded bg-white p-4">
                        <div className="flex justify-between">
                            <div className="flex space-x-4">
                                <img width={55} height={55} src="../../../assets/icons/png/dashboard_properties.png" alt="" />
                                <div>
                                    <h5 className="text-gray-600 font-bold">{propertiesSummary.total_properties?.count || 0}</h5>
                                    <h6 className="mt-1 text-gray-600">Properties</h6>
                                </div>
                            </div>
                            <Link to="/property/property-listing" className="text-red-600 text-xs hover:underline">See all properties &gt;</Link>
                        </div>
                        <div className="grid grid-cols-4 p-2 bg-[#F0F3F8] rounded mt-6 divide-x ">
                            <div className="text-center">
                                <h5 className="text-gray-600 font-bold">{propertiesSummary.total_units_occupied?.count || 0}</h5>
                                <h6 className="mt-1 text-gray-600 text-xs">Occupied</h6>
                            </div>
                            <div className="text-center">
                                <h5 className="text-gray-600 font-bold">{propertiesSummary.total_units_vacant?.count || 0}</h5>
                                <h6 className="mt-1 text-gray-600 text-xs">Vacant</h6>
                            </div>
                            <div className="text-center">
                                <h5 className="text-gray-600 font-bold">{propertiesSummary.published?.count || 0}</h5>
                                <h6 className="mt-1 text-gray-600 text-xs">Published</h6>
                            </div>
                            <div className="text-center">
                                <h5 className="text-gray-600 font-bold">{propertiesSummary.not_published?.count || 0}</h5>
                                <h6 className="mt-1 text-gray-600 text-xs">Not published</h6>
                            </div>
                        </div>
                    </div>
                    <div className="border rounded bg-white p-4">
                        <div className="flex justify-between items-center">
                            <h5 className="text-gray-600">Last 30 Days</h5>
                            <Link to="/property/revenue-breakdown" className="text-red-600 text-xs hover:underline">View all &gt;</Link>
                        </div>
                        <div className="grid grid-cols-2 p-2 rounded mt-6 divide-x ">
                            <div>
                                <h6 className="text-green-500 text-xl font-semibold">Ksh {incomeSummary.paid_rent}</h6>
                                <h6 className="text-green-500 text-xs">Paid rent</h6>
                            </div>
                            <div className="text-center">
                                <h6 className="text-red-500 text-xl font-semibold">Ksh {incomeSummary.unpaid_rent}</h6>
                                <h6 className="text-red-500 text-xs">Open rent</h6>
                            </div>
                        </div>
                        <Link to="" className="mt-4 flex justify-center items-center space-x-2 text-indigo-700 rounded bg-indigo-100 border border-indigo-700">
                            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <mask id="mask0_1903_860" maskUnits="userSpaceOnUse" x="0" y="0" width="19" height="19">
                                    <rect width="19" height="19" fill="#D9D9D9" />
                                </mask>
                                <g mask="url(#mask0_1903_860)">
                                    <path d="M3.16634 9.49996H15.833V6.33329H3.16634V9.49996ZM15.0413 17.4166V15.0416H12.6663V13.4583H15.0413V11.0833H16.6247V13.4583H18.9997V15.0416H16.6247V17.4166H15.0413ZM3.16634 15.8333C2.73092 15.8333 2.35818 15.6783 2.04811 15.3682C1.73804 15.0581 1.58301 14.6854 1.58301 14.25V4.74996C1.58301 4.31454 1.73804 3.9418 2.04811 3.63173C2.35818 3.32166 2.73092 3.16663 3.16634 3.16663H15.833C16.2684 3.16663 16.6412 3.32166 16.9512 3.63173C17.2613 3.9418 17.4163 4.31454 17.4163 4.74996V9.49996H15.0413C13.9462 9.49996 13.0127 9.8859 12.2408 10.6578C11.4689 11.4296 11.083 12.3632 11.083 13.4583V15.8333H3.16634Z" fill="#604AE3" />
                                </g>
                            </svg>
                            <p>Receive Payments</p>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mx-4 mt-6">
                <div className="border rounded bg-white p-4">
                    <div className="flex justify-between items-center text-sm">
                        <h3 className="text-gray-700 text-lg">Recent Inquiries</h3>
                        <Link className="text-red-500 hover:underline" to="/dashboard/inquiries">See all inquiries  &gt;</Link>
                    </div>
                    {inquiries.map((inquiry, index) => (
                        <div key={index} className="flex justify-between items-center border-b py-1">
                            <div>
                                <p className="text-gray-700 text-sm">{inquiry.subject}</p>
                                <p className="text-gray-500 text-xs">{inquiry.contact_name} - {inquiry.contact_phone}</p>
                            </div>

                        </div>
                    ))}
                </div>
                <div className="border rounded bg-gradient-to-r from-red-100 via-red-300 to-red-50 p-4">
                    <div className="flex justify-between items-center text-sm">
                        <h3 className="text-gray-700 text-lg">Due Rent</h3>
                        {/* <select className="border border-gray-600 rounded p-0.5">
                            <option value="">Select due date</option>
                            <option value="1">Today</option>
                            <option value="2">Tomorrow</option>
                            <option value="3">Next 7 days</option>
                            <option value="4">Next 14 days</option>
                            <option value="5">Next 30 days</option>
                        </select> */}
                    </div>

                    {dueDate.map((rent, index) => (
                        <div key={index} className="flex justify-between">
                            <div className="w-2/3">
                                <p className="text-gray-700 text-xs">{rent.property_name} - {rent.location_name}</p>
                                <p className="text-gray-500 text-xs">{rent.tenant_name} - {rent.tenant_phone}</p>

                            </div>
                            <div className="w-1/3 ml-6">
                                <p className="text-xs mb-1">{rent.rent_due_day}</p>
                                <div className="">
                                    <Link to="" className="text-xs rounded text-red-700 bg-red-100 border border-red-700 p-0.5">
                                        <span>Set reminder</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div>
                    <div className="border rounded bg-white">
                        <iframe className="h-full w-full" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31910.261927159412!2d36.84251704769886!3d-1.3054558108504963!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f13ced1aadfd9%3A0xb57f0d76b8a42226!2sKenpoly!5e0!3m2!1ssw!2ske!4v1728889175158!5m2!1ssw!2ske" allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Home2