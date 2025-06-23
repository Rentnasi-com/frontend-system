import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <>
        <p className="text-center text-sm text-gray-500 my-10">
            © <span id="date"></span> <Link to="https://gbt.co.ke" className="hover:underline"
              target="_blank">Created by Greenbear Technologies</Link>. Rentalpay Africa All
            rights reserved.
          </p>
    </>
  )
}

export default Footer