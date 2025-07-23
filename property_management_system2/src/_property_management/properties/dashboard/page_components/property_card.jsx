import { Link } from "react-router-dom";

const PropertyCard = ({ redirectUrl, iconSrc, label, value }) => {
    return (
        <Link to={redirectUrl} className="">
            <div className="flex justify-between items-center">
                <div>
                    <h6 className="text-sm">{label}</h6>
                    <h6 className="text-xs font-semibold mt-4">{value}</h6>
                </div>
                <img className="bg-[#F9F9FF] p-0.5 rounded" width={30} height={30} src={iconSrc} alt={label} />
            </div>
        </Link>
    );
};

export default PropertyCard;
