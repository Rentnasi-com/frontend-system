import axios from "axios";
import { useEffect, useState } from "react";

const Home = () => {
  const currentHour = new Date().getHours();
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  let greeting;

  if (currentHour >= 5 && currentHour < 12) {
    greeting = 'Good morning';
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting = 'Good afternoon';
  } else {
    greeting = 'Good evening';
  }

  const [appsTypes, setAppsTypes] = useState([]);
  const [userResponseData, setUserResponseData] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [appsLoading, setAppsLoading] = useState(true); // Separate loading state for apps

  const SkeletonLoader = ({ className, rounded = false }) => (
    <div
      className={`bg-gray-200 animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
    ></div>
  );

  useEffect(() => {
    const savedSessionId = localStorage.getItem('sessionId');
    const savedUserId = localStorage.getItem('userId');

    if (!userResponseData && savedSessionId && savedUserId) {

      const userData = {
        sessionId: savedSessionId,
        userId: savedUserId
      };

      setLoading(true); // Set loading when starting fetch
      axios.post(`${BASE_URL}/v2/get-user`, userData)
        .then(response => {
          setUserResponseData(response.data);
          console.log(response)
        })
        .catch(error => {
          console.error('Error sending data: https://auth.api.rentnasi.com/v2/get-user', error);
        })
        .finally(() => {
          setLoading(false);
        })
    }

    const fetchAppsType = async () => {
      if (userResponseData && userResponseData.data.authorization.token) {
        setAppsLoading(true);
        try {
          const response = await axios.get(
            `${BASE_URL}/v2/get-all-apps`,
            {
              headers: {
                Authorization: `Bearer ${userResponseData.data.authorization.token}`,
                Accept: 'application/json'
              }
            }
          );
          setAppsTypes(response.data.apps);
        } catch (error) {
          console.error('Error fetching apps: https://auth.api.rentnasi.com/v2/get-all-apps', error);
        } finally {
          setAppsLoading(false);
        }
      } else {
        console.error('userResponseData or token is null or undefined.');
      }
    };

    if (userResponseData && userResponseData.data.authorization.token) {
      fetchAppsType();
    }

  }, [userResponseData, BASE_URL]);
  return (
    <>
      <section className="">
        <div className="mt-6">
          <div className="flex flex-col justify-center items-center space-y-3">
            {loading ? (
              <SkeletonLoader className="w-20 h-20" rounded />
            ) : (
              <img className="w-20 h-20 rounded-full" src=
                {
                  userResponseData ?
                    `${userResponseData.data.user_details.image}` :
                    "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"
                }
                alt="Profile"
              />
            )}

            {loading ? (
              <>
                <SkeletonLoader className="h-8 w-64" />
                <SkeletonLoader className="h-4 w-80" />
              </>
            ) : (
              <>
                <h1 className="text-3xl text-gray-800">{greeting}, {userResponseData ? ` ${userResponseData.data.user_details.firstname} ${userResponseData.data.user_details.lastname}` : 'Loading...'}</h1>
                <p className="text-sm text-gray-500">Manage your info, privacy, and security to make Rentnasi work better for you.</p>

              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-10 mt-6">
        <div className="flex space-x-4">
          <h4 className="tracking-widest text-gray-800">App quick access panel</h4>
          <img className="h-10 w-10" src="/assets/icons/png/corner-right.png" alt="" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-6">
          {appsLoading ? (
            // Show skeleton loaders for apps while loading
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="flex space-x-4 justify-center items-center rounded-md shadow border py-3 px-2">
                <SkeletonLoader className="h-14 w-14" rounded />
                <SkeletonLoader className="h-6 w-24" />
              </div>
            ))
          ) : appsTypes.length > 0 ? (
            // Show actual apps when loaded
            appsTypes.map((type) => (
              <a href={type.app_url} target="_blank" rel="noopener noreferrer" key={type.app_id}>
                <div className="flex space-x-4 justify-center items-center rounded-md shadow border py-3 px-2 hover:bg-gray-50 transition-colors">
                  <img
                    className="h-14 w-14 rounded"
                    src={type.app_logo}
                    alt={type.app_name}
                    onError={(e) => {
                      e.target.src = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
                    }}
                  />
                  <h3 className="text-gray-700 text-md">{type.app_name}</h3>
                </div>
              </a>
            ))
          ) : (
            // Show message if no apps available
            <div className="col-span-4 text-center py-8 text-gray-500">
              No apps available
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default Home