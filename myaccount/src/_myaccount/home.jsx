import axios from "axios";
import { useEffect, useState } from "react";

const Home = () => {
  const currentHour = new Date().getHours();
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

  useEffect(() => {
    const savedSessionId = localStorage.getItem('sessionId');
    const savedUserId = localStorage.getItem('userId');

    if (!userResponseData && savedSessionId && savedUserId) {

      const userData = {
        sessionId: savedSessionId,
        userId: savedUserId
      };

      axios.post('https://auth.api.rentnasi.com/v2/get-user', userData)
        .then(response => {
          setUserResponseData(response.data);
          console.log(response)
        })
        .catch(error => {
          console.error('Error sending data: https://auth.api.rentnasi.com/v2/get-user', error);
        });
    }

    const fetchAppsType = async () => {
      if (userResponseData && userResponseData.data.authorization.token) {
        try {
          const response = await axios.get(
            'https://auth.api.rentnasi.com/v2/get-all-apps',
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
        }
      } else {
        console.error('userResponseData or token is null or undefined.');
      }
    };

    if (userResponseData && userResponseData.data.authorization.token) {
      fetchAppsType();
    }

  }, [userResponseData]);
  return (
    <>
      <section className="">
        <div className="mt-6">
          <div className="flex flex-col justify-center items-center space-y-3">
            <img className="w-20 h-20 rounded-full" src=
              {
                userResponseData?
                  `${userResponseData.data.user_details.image}` :
                  "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"
              } alt="" />
            <h1 className="text-3xl text-gray-800">{greeting}, {userResponseData ? ` ${userResponseData.data.user_details.firstname} ${userResponseData.data.user_details.lastname}` : 'Loading...'}</h1>
            <p className="text-sm text-gray-500">Manage your info, privacy, and security to make Rentnasi work better for you.</p>
          </div>
        </div>
      </section>

      <section className="mx-10 mt-6">
        <div className="flex space-x-4">
          <h4 className="tracking-widest text-gray-800">App quick access panel</h4>
          <img className="h-10 w-10" src="/assets/icons/png/corner-right.png" alt="" />
        </div>
        <div className="grid grid-cols-3 gap-4 py-6">
          {
            appsTypes.map((type) => (
              <a href={type.app_url} target="blank" key={type.app_id}>
                <div className="flex space-x-4 justify-center items-center rounded-md shadow border py-10 px-3">

                  <img className="h-14 w-14 rounded" src={type.app_logo} alt="" />
                  <h3 className="text-gray-700 text-md">{type.app_name}</h3>
                </div>
              </a>
            ))
          }
        </div>
      </section>
    </>
  )
}

export default Home