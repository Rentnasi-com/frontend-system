import { Link } from "react-router-dom";

const StatCard = ({ redirectUrl, iconSrc, progress, label, value }) => {
  return (
    <Link to={redirectUrl} className="bg-white border border-gray-200 hover:bg-gray-100 rounded-lg p-2">
      <div className="flex justify-between items-center">
        <img width={30} height={30} src={iconSrc} alt={label} />
        <div className="flex">
          <div className="bg-green-200 rounded text-xs flex items-center space-x-1">
            <div className="rounded-full bg-green-500 h-0.5 border border-green-400"></div>
            <p className="text-xs font-semibold">{progress}%</p>
          </div>
          <p className="text-xs px-2">Last Month</p>
        </div>
        <img width={15} height={15} src="../../../assets/icons/png/dots.png" alt="options" />
      </div>
      <div className="flex justify-between mt-4">
        <h6 className="text-sm font-semibold">{label}</h6>
        <h6 className="text-xs font-semibold">{value}</h6>
      </div>
    </Link>
  );
};

export default StatCard;
