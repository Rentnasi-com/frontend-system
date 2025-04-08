import { DashboardHeader } from "./page_components";


const ChatRoom = () => {
    const issues = [
        {
            id: "#809043",
            subject: "Electrical issue on my bedroom",
            status: "Open",
            time: "10:23 AM",
            priority: "High",
            assignedTo: "IBRAHIM",
            clientName: "Simon Kamau",
            clientNumber: "0797357665",
            date: "5 January 2024",
        },
        {
            id: "#809043",
            subject: "Electrical issue on my bedroom",
            status: "Open",
            time: "10:23 AM",
            priority: "High",
            assignedTo: "IBRAHIM",
            clientName: "Simon Kamau",
            clientNumber: "0797357665",
            date: "5 January 2024",
        },

    ];
    return (
        <section className="">
            <DashboardHeader
                title="Simon Kamau Inquiry Center"
                description="Connect and Thrive: Engage with Your Tenants Now!"
            />
            <div className="grid grid-cols-1 md:grid-cols-4 border rounded my-2 mx-4">

                
                <div className="border-r bg-white">
                    <h3 className="text-sm font-semibold mb-2 border-b p-2">Subject</h3>
                    {issues.map((issue, index) => (
                        <div key={index} className="mb-2 mx-1 p-2 bg-gray-50 rounded border">
                            <div className="flex justify-between items-center">
                                <h5 className="text-xs">{issue.id} {issue.subject}</h5>
                                <span className="text-xs">{issue.time}</span>
                            </div>
                            <div className="flex justify-between mt-2 items-center">
                                <span className="bg-purple-600 text-white rounded-full px-2 py-1 text-xs">
                                    {issue.status}
                                </span>
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">{issue.priority}</span>
                            </div>
                        </div>
                    ))}
                </div>

                
                <div className="md:col-span-2 bg-white">
                    <div className="flex justify-between items-center border-b p-2">
                        <h2 className="text-sm font-semibold">{issues[0].clientName}</h2>
                        <button className="bg-red-600 text-white px-4 py-0.5 rounded text-xs">Call Now</button>
                    </div>
                    <div className="bg-white p-2 rounded text-xs">
                        <h3 className="font-semibold">Electrical Issue on my bathroom</h3>
                        <p>Client number: {issues[0].clientNumber}</p>
                        <p>Date: {issues[0].date}</p>
                        <p>Status: {issues[0].status}</p>
                        <p>Priority: {issues[0].priority}</p>
                    </div>
                    <div className="bg-gray-50 border-y flex justify-between p-2 text-xs">
                        <h4 className="font-bold">STATUS: {issues[0].status.toUpperCase()}</h4>
                        <p>ASSIGNED TO: {issues[0].assignedTo}</p>
                    </div>
                    <div className="mt-4 bg-white p-4 rounded">
                        {/* Chat */}
                        <div className="mb-2 text-xs">
                            <div className="flex">
                                <div className="bg-gray-200 px-2 py-1 rounded-lg max-w-md">
                                    Hello
                                </div>
                            </div>
                            <div className="flex mt-2">
                                <div className="bg-gray-200 px-2 py-1 rounded-lg max-w-md">
                                    Electrical issue on my bedroom
                                </div>
                            </div>
                            <div className="flex mt-2">
                                <div className="bg-gray-200 px-2 py-1 rounded-lg max-w-md">
                                    Please call me
                                </div>
                            </div>
                        </div>
                        {/* Response */}
                        <div className="flex justify-end mt-2 text-xs">
                            <div className="bg-green-200 px-2 py-1 rounded-lg max-w-md">
                                Calling you in a few
                            </div>
                        </div>
                        {/* Message Input */}
                        <div className="mt-4 flex items-center border-t pt-4">
                            <button className="mr-4">
                                <img src="../../../../../public/assets/icons/png/attach.png" alt="Attach" width={20} />
                            </button>
                            <input
                                type="text"
                                placeholder="Type your message here..."
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                            <button className="ml-4 bg-red-600 text-white p-2 rounded-full">
                                <img src="../../../../../public/assets/icons/png/send.png" alt="Send" width={20} />
                            </button>
                        </div>
                    </div>
                </div>

                
                <div className="border-l bg-white">
                    <h3 className="text-sm font-semibold mb-2 border-b p-2">Profile</h3>
                    <div className="flex flex-col justify-center items-center my-4">
                        <img
                            src="/assets/images/profile.png"
                            alt="Profile"
                            className="w-12 h-12 rounded-full mr-4"
                        />
                        <div>
                            <h4 className="font-semibold text-sm text-center">{issues[0].clientName}</h4>
                            <p className="text-sm ">King Serenity, B4, 4th Floor</p>
                        </div>
                    </div>
                    <div className="flex justify-center items-center space-x-3 mb-4 p-2">
                        <button className="bg-white border-red-400 border p-2 rounded-md flex items-center text-sm">
                            <img src="../../../../../public/assets/icons/png/call.png" alt="Call" className="w-4 h-4 mr-2" />
                            Call
                        </button>
                        <button className="bg-white border-red-400 border p-2 rounded-md flex items-center text-sm">
                            <img src="../../../../../public/assets/icons/png/email.png" alt="Call" className="w-4 h-4 mr-2" />
                            Call
                        </button>
                    </div>
                    <div className="p-2 text-sm">
                        <p>About: Simon Mwangi</p>
                        <p>Flat: King Serenity plaza</p>
                        <p>Unit: 14</p>
                        <p>Profession: Business man</p>
                        <p>Tenant from: 14th Feb 2000</p>
                        <p>Phone number: 123456789</p>
                        <div className="flex justify-between mt-4">
                            <label className="text-sm">Mark as done</label>
                            <input type="checkbox" className="toggle-checkbox" />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

export default ChatRoom