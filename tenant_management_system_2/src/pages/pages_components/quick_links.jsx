import { Link } from "react-router-dom"

const QuickLinksCard = ({icon, url, title, description, bgColor}) => {
    return (
        <Link to={url} className={`${bgColor} p-2 rounded-lg flex space-x-3`}>
            <div className="flex justify-center items-center bg-white p-1 rounded-full w-8 h-7">
                <img src={icon} alt="" />
            </div>
            <div className="">
                <p>{title}</p>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
        </Link>
    )
}

export default QuickLinksCard