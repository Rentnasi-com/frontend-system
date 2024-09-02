import axios from "axios"
import { useEffect, useState } from "react"

const View_Apps = () => {
    const [appTypes, setAppsTypes] = useState([])
    const token = localStorage.getItem('token')
    useEffect(() => {
        const fetchApps = async () => {
            try {
                const response = await axios.get(
                    'https://auth.api.rentnasi.com/v2/get-all-apps',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/json'
                        }
                    }
                )
                setAppsTypes(response.data.apps)
            } catch (error) {
                console.error('error')
            }
        }
        fetchApps()
    }, [token])

    return (
        (appTypes ? (
            <section className="">
                <div className="p-4 flex justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-700">Overview</h1>
                        <p className="text-sm text-gray-500">Real-time information and activities of your property.</p>
                    </div>
                    <div className="">
                        <div className="flex space-x-4">
                            
                            <div className="bg-white p-2 rounded-xl shadow">
                                <p className="text-xs text-gray-600 flex space-x-2 text-center">
                                    <span>March 27 2024 - January 25 2025</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4 py-6 mx-4">
                    {
                        appTypes.map((type) => (
                            <a href={type.app_url} target="blank" key={type.app_id}>
                                <div className="bg-white flex space-x-4 justify-center items-center rounded-md shadow py-10 px-3">

                                    <img className="h-14 w-14 rounded" src={type.app_logo} alt="" />
                                    <h3 className="text-gray-700 text-md">{type.app_name}</h3>
                                </div>
                            </a>
                        ))
                    }
                </div>
            </section>
        ) : (
            <div className="">Loading ...</div>
        ))
    )
}

export default View_Apps