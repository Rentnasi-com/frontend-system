const Home = () => {
  return (
    <div className="mx-4 mt-4 grid grid-cols-3 gap-4">
      <div className="bg-white col-span-2 rounded shadow p-2">
        <h4 className="font-semibold text-lg">My Details</h4>
        <hr className="h-px mb-2 bg-gray-200 border-0" />
        <div className="flex items-center">
          <img
            height={20}
            width={20}
            className="object-cover w-full rounded-lg h-96 md:h-auto md:w-48"
            src="https://www.decorpot.com/images/1276663270drawing-room-design-for-your-modern-home.jpg"
          />
          <div className="flex justify-between leading-normal">
            <div className="ml-4">
              <div>
                <h5 className="text-md font-semibold tracking-tight text-gray-900">Name</h5>
                <p className="font-normal text-gray-700">Simeon Mwangi</p>
              </div>
              <div className="mt-2">
                <h5 className="text-md font-semibold tracking-tight text-gray-900">Mobile</h5>
                <p className="font-normal text-gray-700">+254 797 357 665</p>
              </div>
            </div>
            <div className="ml-40">
              <div>
                <h5 className="text-md font-semibold tracking-tight text-gray-900">Email</h5>
                <p className="font-normal text-gray-700">email@username.com</p>
              </div>
              <div className="mt-2">
                <h5 className="text-md font-semibold tracking-tight text-gray-900">Booking info</h5>
                <p className="font-normal text-gray-700">simon apartment, 3rd floor, unit k12</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded shadow p-2">
        <h4 className="font-semibold text-lg">Owner Details</h4>
        <hr className="h-px mb-2 bg-gray-200 border-0" />
        <div>
          <div>
            <h5 className="text-md font-semibold tracking-tight text-gray-900">Name</h5>
            <p className="font-normal text-gray-700">Simeon Mwangi</p>
          </div>
          <div className="mt-2">
            <h5 className="text-md font-semibold tracking-tight text-gray-900">Contact Details</h5>
            <p className="font-normal text-gray-700">123456789</p>
            <p className="font-normal text-gray-700">+254 797 357 665</p>
          </div>
        </div>
      </div>
      <div className="bg-white col-span-2 rounded shadow p-2">
        <h4 className="font-semibold text-lg">My Details</h4>
        <hr className="h-px mb-2 bg-gray-200 border-0" />
        <div>
          <div className="flex items-center">
            <img
              height={20}
              width={20}
              className="object-cover w-full rounded-lg h-96 md:h-auto md:w-48"
              src="https://www.decorpot.com/images/1276663270drawing-room-design-for-your-modern-home.jpg"
            />
            <div className="flex justify-between leading-normal">
              <div className="ml-4">
                <div>
                  <h5 className="text-md font-semibold tracking-tight text-gray-900">Unit name</h5>
                  <p className="font-normal text-gray-700">2 Bedroom, Unit MK12</p>
                </div>
                <div className="mt-2">
                  <h5 className="text-md font-semibold tracking-tight text-gray-900">Location</h5>
                  <p className="font-normal text-gray-700">Sironik road, OP15</p>
                </div>
              </div>
              <div className="ml-40">
                <div>
                  <h5 className="text-md font-semibold tracking-tight text-gray-900">Moved in</h5>
                  <p className="font-normal text-gray-700">4th may 2000</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <div>
              <p className="text-sm font-normal text-gray-500">Deposit amount <span className="text-green-600">( paid )</span></p>
              <p className="font-semibold text-gray-700">Ksh 12,000</p>
            </div>
            <div>
              <p className="text-sm font-normal text-gray-500">Rent amount <span className="text-orange-500">( not yet paid )</span></p>
              <p className="font-semibold text-gray-700">Ksh 12,000 <span className="text-red-500 text-sm pl-6">PAY NOW</span></p>
            </div>
            <div>
              <p className="text-sm font-normal text-gray-500">Water deposit <span className="text-orange-500">( not yet paid )</span></p>
              <p className="font-semibold text-gray-700">Ksh 5,000 <span className="text-red-500 text-sm pl-6">PAY NOW</span></p>
            </div>
            <div>
              <p className="text-sm font-normal text-gray-500">Electricity deposit <span className="text-orange-500">( not yet paid )</span></p>
              <p className="font-semibold text-gray-700">Ksh 2,000 <span className="text-red-500 text-sm pl-6">PAY NOW</span></p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded shadow p-2">
        <h4 className="font-semibold text-lg">Documents</h4>
        <hr className="h-px mb-2 bg-gray-200 border-0" />
        <div>
          <div>
            <h5 className="text-md font-semibold tracking-tight text-gray-900">Passport</h5>
            <p className="flex font-normal text-gray-700">click to view your passport
              <span>
                <svg width="7" height="7" viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.20977 7.00195L0.509766 6.30195L5.30976 1.50195H1.00977V0.501953H7.00976V6.50195H6.00976V2.20195L1.20977 7.00195Z" fill="#CB0101" />
                </svg>
              </span>
            </p>
          </div>
          <div className="mt-2">
            <h5 className="text-md font-semibold tracking-tight text-gray-900">National Id</h5>
            <p className="flex font-normal text-gray-700">click to view your passport
              <span>
                <svg width="7" height="7" viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.20977 7.00195L0.509766 6.30195L5.30976 1.50195H1.00977V0.501953H7.00976V6.50195H6.00976V2.20195L1.20977 7.00195Z" fill="#CB0101" />
                </svg>
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white col-span-3 rounded shadow p-2">
        <h4 className="font-semibold text-lg">Documents</h4>
        <hr className="h-px mb-2 bg-gray-200 border-0" />
        <div className="mt-2 space-y-2">
          <p className="text-xs font-normal text-gray-500">6 months min stay duration notice period of 1 month thereafter</p>
          <p className="text-xs font-normal text-gray-500">6 months min stay duration notice period of 1 month thereafter</p>
        </div>
      </div>
    </div>
  )
}

export default Home