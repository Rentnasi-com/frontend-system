import { Link, useLocation } from "react-router-dom";
import { Bar } from 'react-chartjs-2';
import { useEffect, useState } from "react";
import axios from "axios";
import { DashboardHeader } from "./page_components";

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
    const [propertiesSummary, setPropertiesSummary] = useState(null) // Initialize as null
    const [incomeSummary, setIncomeSummary] = useState(null)
    const token = localStorage.getItem("token")
    const [propertyCardStats, setPropertyCardStats] = useState(null)
    const [inquiries, setInquiries] = useState(null)
    const [dueDate, setDueDate] = useState(null)
    const [barGraph, setBarGraph] = useState(null)
    const [loading, setLoading] = useState(true) // Add loading state

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const duration = queryParams.get('duration') || 'month';
    const unitInfo = queryParams.get('unit_info') || 'overview';

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
            const res = await axios.get(`${baseUrl}/dashboard/due-rent?limit=5`,
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                await Promise.all([
                    fetchPropertiesSummary(),
                    fetchPropertiesInquiries(),
                    fetchCardItems(),
                    fetchDueDate()
                ]);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [baseUrl, token, duration, unitInfo]);

    // Placeholder data for cards
    const placeholderCardItems = [
        {
            name: "Expected",
            value: "Ksh 0",
            percentage: "0%",
            color: "#604AE3",
            textColor: "#089964",
            borderColor: "#089964",
            background: "#DFF2EB"
        },
        {
            name: "Received",
            value: "Ksh 0",
            percentage: "0%",
            color: "#089964",
            textColor: "#089964",
            borderColor: "#089964",
            background: "#DFF2EB"
        },
        {
            name: "Balance",
            value: "Ksh 0",
            percentage: "0%",
            color: "#CB0101",
            textColor: "#CB0101",
            borderColor: "#CB0101",
            background: "#FAE8E8"
        },
    ];

    // Placeholder data for bar chart
    const placeholderData = {
        labels: ['Loading...', 'Loading...', 'Loading...'],
        datasets: [{
            label: 'Revenue',
            data: [0, 0, 0],
            backgroundColor: 'rgba(200, 200, 200, 0.2)',
            borderColor: 'rgba(200, 200, 200, 1)',
            borderWidth: 0.5,
            barThickness: 10
        }]
    };

    // Actual data or placeholder data
    const cardItems = loading ? placeholderCardItems : [
        {
            name: "Expected",
            value: `Ksh ${(propertyCardStats.expected || "0").toLocaleString()}`,
            percentage: "10%",
            color: "#604AE3",
            textColor: "#089964",
            borderColor: "#089964",
            background: "#DFF2EB"
        },
        {
            name: "Received",
            value: `Ksh ${(propertyCardStats.received || "0").toLocaleString()}`,
            percentage: "4.6%",
            color: "#089964",
            textColor: "#089964",
            borderColor: "#089964",
            background: "#DFF2EB"
        },
        {
            name: "Balance",
            value: `Ksh ${(propertyCardStats.balance || "0").toLocaleString()}`,
            percentage: "4.8%",
            color: "#CB0101",
            textColor: "#CB0101",
            borderColor: "#CB0101",
            background: "#FAE8E8"
        },
    ];

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


    const data = loading ? placeholderData : {
        labels: barGraph?.map(item => item.month + " - " + item.year) || ['No data'],
        datasets: [{
            label: 'Revenue',
            data: barGraph?.map(item => item.amount) || [0],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 0.5,
            barThickness: 10
        }]
    };

    // Skeleton loader component
    const SkeletonLoader = ({ className }) => (
        <div className={`bg-gray-200 animate-pulse rounded ${className}`}></div>
    );

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
                            {loading ? (
                                <SkeletonLoader className="h-64 w-full" />
                            ) : (
                                <Bar data={data} />
                            )}
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
                                {loading ? (
                                    <SkeletonLoader className="w-[55px] h-[55px] rounded" />
                                ) : (
                                    <img width={55} height={55} src="../../../assets/icons/png/dashboard_properties.png" alt="" />
                                )}
                                <div>
                                    {loading ? (
                                        <>
                                            <SkeletonLoader className="h-6 w-16 mb-2" />
                                            <SkeletonLoader className="h-4 w-24" />
                                        </>
                                    ) : (
                                        <>
                                            <h5 className="text-gray-600 font-bold">{propertiesSummary?.total_properties?.count || 0}</h5>
                                            <h6 className="mt-1 text-gray-600">Properties</h6>
                                        </>
                                    )}
                                </div>
                            </div>
                            <Link to="/property/property-listing" className="text-red-600 text-xs hover:underline">See all properties &gt;</Link>
                        </div>
                        {loading ? (
                            <SkeletonLoader className="h-20 mt-6 w-full" />
                        ) : (
                            <div className="grid grid-cols-4 p-2 bg-[#F0F3F8] rounded mt-6 divide-x ">
                                <div className="text-center">
                                    <h5 className="text-gray-600 font-bold">{propertiesSummary?.total_units_occupied?.count || 0}</h5>
                                    <h6 className="mt-1 text-gray-600 text-xs">Occupied</h6>
                                </div>
                                <div className="text-center">
                                    <h5 className="text-gray-600 font-bold">{propertiesSummary?.total_units_vacant?.count || 0}</h5>
                                    <h6 className="mt-1 text-gray-600 text-xs">Vacant</h6>
                                </div>
                                <div className="text-center">
                                    <h5 className="text-gray-600 font-bold">{propertiesSummary?.published?.count || 0}</h5>
                                    <h6 className="mt-1 text-gray-600 text-xs">Published</h6>
                                </div>
                                <div className="text-center">
                                    <h5 className="text-gray-600 font-bold">{propertiesSummary?.not_published?.count || 0}</h5>
                                    <h6 className="mt-1 text-gray-600 text-xs">Not published</h6>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="border rounded bg-white p-4">
                        <div className="flex justify-between items-center">
                            <h5 className="text-gray-600">Last 30 Days</h5>
                            <Link to="/property/revenue-breakdown" className="text-red-600 text-xs hover:underline">View all &gt;</Link>
                        </div>
                        {loading ? (
                            <SkeletonLoader className="h-20 mt-6 w-full" />
                        ) : (
                            <div className="grid grid-cols-2 p-2 rounded mt-6 divide-x ">
                                <div>
                                    <h6 className="text-green-500 text-xl font-semibold">Ksh {incomeSummary?.paid_rent?.toLocaleString() || 0}</h6>
                                    <h6 className="text-green-500 text-xs">Paid rent</h6>
                                </div>
                                <div className="text-center">
                                    <h6 className="text-red-500 text-xl font-semibold">Ksh {incomeSummary?.unpaid_rent?.toLocaleString() || 0}</h6>
                                    <h6 className="text-red-500 text-xs">Unpaid rent</h6>
                                </div>
                            </div>
                        )}
                        {loading ? (
                            <SkeletonLoader className="h-10 mt-4 w-full" />
                        ) : (
                            <Link to="" className="mt-4 flex justify-center items-center space-x-2 text-indigo-700 rounded bg-indigo-100 border border-indigo-700">
                                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    {/* SVG path */}
                                </svg>
                                <p>Receive Payments</p>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mx-4 mt-6">
                <div className="border rounded bg-white p-4">
                    <div className="flex justify-between items-center text-sm">
                        <h3 className="text-gray-700 text-lg">Recent Inquiries</h3>
                        <Link className="flex space-x-2 text-red-500 hover:text-red-600 hover:underline" to="/dashboard/inquiries">
                            See all inquiries
                            <svg className="w-3 h-3 text-gray-800 hover:text-red-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778" />
                            </svg>
                        </Link>
                    </div>
                    {loading ? (
                        Array(3).fill(0).map((_, index) => (
                            <div key={index} className="flex justify-between items-center border-b py-3">
                                <div className="w-full">
                                    <SkeletonLoader className="h-4 w-3/4 mb-2" />
                                    <SkeletonLoader className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))
                    ) : (
                        inquiries?.map((inquiry, index) => (
                            <div key={index} className="flex justify-between items-center border-b py-1">
                                <div>
                                    <p className="text-gray-700 text-sm">{inquiry.subject}</p>
                                    <p className="text-gray-500 text-xs">{inquiry.contact_name} - {inquiry.contact_phone}</p>
                                </div>
                            </div>
                        )) || <p className="text-gray-500 text-sm">No inquiries found</p>
                    )}
                </div>
                <div className="border rounded bg-gradient-to-r from-red-100 via-red-300 to-red-50 p-4 divide-y divide-black divide-dashed">
                    <div className="flex justify-between items-center text-sm">
                        <h3 className="text-gray-700 text-lg">Due Rent</h3>
                        <Link className="flex space-x-2 text-red-500 hover:underline" to="/dashboard/due-rent">
                            See all due rent
                            <svg className="w-3 h-3 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778" />
                            </svg>
                        </Link>
                    </div>
                    {loading ? (
                        Array(3).fill(0).map((_, index) => (
                            <div key={index} className="flex justify-between py-4">
                                <div className="w-2/3">
                                    <SkeletonLoader className="h-4 w-full mb-2" />
                                    <SkeletonLoader className="h-3 w-3/4" />
                                </div>
                                <div className="w-1/3 ml-6">
                                    <SkeletonLoader className="h-3 w-full mb-2" />
                                    <SkeletonLoader className="h-6 w-24" />
                                </div>
                            </div>
                        ))
                    ) : (
                        dueDate?.map((rent, index) => (
                            <div key={index} className="flex justify-between py-4">
                                <div className="w-2/3">
                                    <p className="text-gray-700 text-xs">{rent.property_name} - {rent.location_name}</p>
                                    <p className="text-gray-500 text-xs">{rent.tenant_name} - {rent.tenant_phone}</p>
                                </div>
                                <div className="w-1/3 ml-6">
                                    <p className="text-xs mb-1">Date {rent.rent_due_day} of every month.</p>
                                    <div className="">
                                        <Link to="" className="text-xs rounded text-red-700 bg-red-100 border border-red-700 p-0.5">
                                            <span>Set reminder</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )) || <p className="text-gray-700 text-sm py-4">No due rents found</p>
                    )}
                </div>
                <div>
                    <div className="border rounded bg-white h-full">
                        {loading ? (
                            <SkeletonLoader className="h-full w-full" />
                        ) : (
                            <iframe className="h-full w-full" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31910.261927159412!2d36.84251704769886!3d-1.3054558108504963!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f13ced1aadfd9%3A0xb57f0d76b8a42226!2sKenpoly!5e0!3m2!1ssw!2ske!4v1728889175158!5m2!1ssw!2ske" allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Home2