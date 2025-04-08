import { Link } from "react-router-dom"
import { useState } from "react";
import { Modal, PropertyCard, QuickLinksCard, TableRow } from "../pages_components";
import { CheckboxField, SelectField, Textarea, TextInput } from "../../components";


const SingleTenants = () => {
    const quicks = [
        {
            url: "/reports",
            icon: "./../../../../assets/icons/png/reports.png",
            title: "Reports",
            description: "View all your property reports",
            bgColor: "bg-[#BAE5F5]"
        },
        {
            url: "/maintenance",
            icon: "./../../../../assets/icons/png/maintenance.png",
            title: "Maintenance",
            description: "Manage your maintenance request",
            bgColor: "bg-[#CCF0C0]"
        },
        {
            url: "/inquiries",
            icon: "./../../../../assets/icons/png/inquiries-1.png",
            title: "Inquiries",
            description: "View all your tenant inquiries",
            bgColor: "bg-[#E1D3FE]"
        }
    ]
    const stats = [

        {
            redirectUrl: "/tenants/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/expected_income.png",
            progress: 20,
            label: "Expected Income",
            value: "20,000",
        },

        {
            redirectUrl: "/tenants/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/outstanding_balance.png",
            progress: 20,
            label: "Outstanding Balance",
            value: "10,000",
        },
        {
            redirectUrl: "/tenants/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/total_fines.png",
            progress: 20,
            label: "Total fines",
            value: "1,000",
        },
    ];
    const properties = [
        {
            datePaid: "Feb 2024",
            rentAmount: "KES 20,000",
            balance: "0.00",
            fines: "KES 2,000",
            rowTotal: "KES 22,000",
            rentStatus: "Paid",
            eyeLink: "/tenants/payment-history",
            isShowingActions: true
        },
        {
            datePaid: "Mar 2024",
            rentAmount: "KES 20,000",
            balance: "-",
            fines: "-",
            rowTotal: "KES 20,000",
            rentStatus: "Paid",
            eyeLink: "/tenants/payment-history",
            isShowingActions: true
        },
        {
            datePaid: "Apr 2024",
            rentAmount: "KES 20,000",
            balance: "-",
            fines: "-",
            rowTotal: "KES 20,000",
            rentStatus: "Paid",
            eyeLink: "/tenants/payment-history",
            isShowingActions: true
        },
        {
            datePaid: "May 2021",
            rentAmount: "KES 20,000",
            balance: "KES 10,000",
            fines: "KES 2,000",
            rowTotal: "KES 24,000",
            rentStatus: "pending",
            eyeLink: "/tenants/payment-history",
            isShowingActions: true
        },
    ];
    const [isModalOpen, setModalOpen] = useState(false);

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 border rounded m-4">
                <div className="p-2 bg-white rounded border-r">

                    <div className="flex items-center space-x-4 mb-4">
                        <img
                            src="https://images.prop24.com/ngby3ayrl5uqiicx3pkjaatr3u/Crop600x400"
                            alt="Apartment"
                            className="w-16 h-16 rounded-md"
                        />
                        <div>
                            <h2 className="font-semibold">B14, 4th Floor, King Serenity</h2>
                            <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-md">
                                Occupied
                            </span>
                        </div>
                    </div>

                    <div className="border-b pb-4 mb-4">
                        <h3 className="font-bold text-gray-700 mb-2">Unit details</h3>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li>
                                <span className="font-medium">Location:</span> King Serenity, Ongata Rongai
                            </li>
                            <li>
                                <span className="font-medium">Property type:</span> Apartment
                            </li>
                            <li>
                                <span className="font-medium">Unit type:</span> Bedsitter
                            </li>
                            <li>
                                <span className="font-medium">Floor number:</span> 3rd Floor
                            </li>
                        </ul>
                    </div>

                    <div className="border-b pb-4 mb-4">
                        <h3 className="font-bold text-gray-700 mb-2">Tenant details</h3>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li>
                                <span className="font-medium">Name:</span> Simon Kamau
                            </li>
                            <li>
                                <span className="font-medium">Email:</span> simonkamau@gmail.com
                            </li>
                            <li>
                                <span className="font-medium">Phone number:</span> +254797357665
                            </li>
                            <li>
                                <span className="font-medium">ID number:</span> 38074241
                            </li>
                        </ul>
                    </div>

                    <div className="border-b pb-4 mb-4">
                        <h3 className="font-bold text-gray-700 mb-2">Tenant next of kin details</h3>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li>
                                <span className="font-medium">Name:</span> Simon Kamau
                            </li>
                            <li>
                                <span className="font-medium">Relationship:</span> Son
                            </li>
                        </ul>
                    </div>

                    <div className="flex justify-center items-center mb-4">
                        <Link to="w-40">
                            <div className="flex space-x-3 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-xs px-2 py-2.5">
                                <p>New Tenant</p>
                                <img width={15} height={15} src="../../../assets/icons/png/plus.png" alt="" />
                            </div>
                        </Link>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-bold text-gray-700">Tenancy History</h3>
                        <table className="min-w-full text-left text-sm text-gray-600 mt-2">
                            <thead>
                                <tr>
                                    <th className="font-medium">Tenant name</th>
                                    <th className="font-medium">Phone number</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array(6).fill().map((_, index) => (
                                    <tr className="text-sm" key={index}>
                                        <td>Simion Kamau</td>
                                        <td>0797357665</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Link to="/tenants/unit/tenant-history" className="mt-4 text-red-600 font-medium text-xs">View all</Link>
                    </div>
                </div>
                <div className="col-span-2 bg-white">
                    <div className="mt-4 w-full px-4">
                        <h3 className="text-red-500 font-semibold text-xs">Quick action</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 ">
                            {quicks.map((quick, index) => (
                                <QuickLinksCard
                                    key={index}
                                    url={quick.url}
                                    icon={quick.icon}
                                    title={quick.title}
                                    description={quick.description}
                                    bgColor={quick.bgColor}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 py-1 px-4 mt-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white border border-gray-200 hover:bg-gray-100 rounded-lg p-2">
                                <PropertyCard
                                    redirectUrl={stat.redirectUrl}
                                    iconSrc={stat.iconSrc}
                                    label={stat.label}
                                    value={stat.value}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5">
                        <h4 className="text-md text-gray-600 my-4 px-2">Payment Overview</h4>
                        <div className="w-full">
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto">
                                    <thead className="bg-gray-100 text-left text-xs">
                                        <tr>
                                            <th className="px-4 py-2">Date</th>
                                            <th className="px-4 py-2">Rent</th>
                                            <th className="px-4 py-2">Fines</th>
                                            <th className="px-4 py-2">Balance</th>
                                            <th className="px-4 py-2">Total</th>
                                            <th className="px-4 py-2">Status</th>
                                            <th className="px-4 py-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {properties.map((property, index) => (
                                            <TableRow
                                                key={index}
                                                datePaid={property.datePaid}
                                                rentAmount={property.rentAmount}
                                                fines={property.fines}
                                                balance={property.balance}
                                                rowTotal={property.rowTotal}
                                                rentStatus={property.rentStatus}
                                                eyeLink={property.eyeLink}
                                                isShowingActions={property.isShowingActions}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="w-36 mx-4 mt-8">
                        <button onClick={openModal}>
                            <div className="flex space-x-3 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-xs px-2 py-2.5">
                                <p>Receive Payment</p>
                                <img width={15} height={15} src="../../../assets/icons/png/plus.png" alt="" />
                            </div>
                        </button>
                    </div>
                    <Modal isOpen={isModalOpen} closeModal={closeModal}>
                        <h2 className="text-lg font-semibold">Receive Payment</h2>
                        <hr />
                        <p className="text-gray-600 my-4">
                            You can update payment manually
                        </p>
                        <div className="grid grid-cols-2 gap-x-3">
                            <SelectField
                                label="Select item paid for"
                                name="itemPaidFor"
                                options={["Item 1", "Item 2", "Item 3"]}
                            />
                            <TextInput
                                label="Enter amount"
                                name="amount"
                                placeholder="Enter amount"
                                type="number"
                            />
                            <SelectField
                                label="Select payment date"
                                name="itemPaidFor"
                                options={["Item 1", "Item 2", "Item 3"]}
                            />
                            <CheckboxField
                                label="Is item fully paid"
                                name="isFullyPaid"
                            />

                            <TextInput
                                label="Enter reference code"
                                name="amount"
                                placeholder="Enter reference code"
                                type="number"
                            />
                        </div>
                        <div className="col-span-2">
                            <Textarea
                                label="Enter note (optional)"
                                name="note"
                                placeholder="Enter your note"
                            />
                        </div>
                        <hr />
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={closeModal}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                Add payment
                            </button>
                        </div>
                    </Modal>
                </div>
            </div>
        </>
    )
}

export default SingleTenants