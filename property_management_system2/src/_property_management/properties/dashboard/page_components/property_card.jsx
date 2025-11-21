import { Link } from "react-router-dom";

const colorMap = {
    red: {
        border: "border-red-400",
        label: "text-red-700",
        value: "text-red-600",
    },
    green: {
        border: "border-green-500",
        label: "text-green-700",
        value: "text-green-600",
    },
    blue: {
        border: "border-blue-500",
        label: "text-blue-700",
        value: "text-blue-600",
    },
    amber: {
        border: "border-amber-500",
        label: "text-amber-700",
        value: "text-amber-600",
    },
    gray: {
        border: "border-gray-400",
        label: "text-gray-700",
        value: "text-gray-600",
    },
};

const detectStatus = (label) => {
    const l = label?.toLowerCase() || "";

    if (l.includes("arrear") || l.includes("fine") || l.includes("balance")) return "red";

    if (l.includes("vacant") || l.includes("available")) return "green";
    if (l.includes("occupied")) return "blue";

    if (l.includes("amount paid")) return "green";
    if (l.includes("rent payable") || l.includes("total payable")) return "blue";

    return "gray";
};

const PropertyCard = ({ redirectUrl, label, value }) => {
    const status = detectStatus(label);
    const scheme = colorMap[status];

    return (
        <Link
            to={redirectUrl}
            className={`block bg-white border ${scheme.border} rounded-xl p-4 shadow-md hover:shadow-lg transition-all`}
        >
            <div className="flex justify-between items-center">
                <h6 className={`text-sm font-medium ${scheme.label}`}>{label}</h6>
                <h6 className={`text-lg font-bold font-mono ${scheme.value}`}>{value}</h6>
            </div>
        </Link>
    );
};

export default PropertyCard;
