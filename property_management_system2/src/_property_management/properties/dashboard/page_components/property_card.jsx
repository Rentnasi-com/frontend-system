import { Link } from "react-router-dom";
import { useMemo } from "react";

const PropertyCard = ({ redirectUrl, iconSrc, label, value }) => {
    // Generate random color scheme for each card
    const colorScheme = useMemo(() => {
        const schemes = [
            {
                bg: 'from-blue-50 to-indigo-100',
                border: 'border-blue-200/60',
                hoverBorder: 'hover:border-blue-300',
                labelColor: 'text-blue-800',
                labelHover: 'group-hover:text-blue-900',
                valueColor: 'text-indigo-600',
                valueHover: 'group-hover:text-indigo-700',
                shadow: 'hover:shadow-blue-200/25'
            },
            {
                bg: 'from-emerald-50 to-teal-100',
                border: 'border-emerald-200/60',
                hoverBorder: 'hover:border-emerald-300',
                labelColor: 'text-emerald-800',
                labelHover: 'group-hover:text-emerald-900',
                valueColor: 'text-teal-600',
                valueHover: 'group-hover:text-teal-700',
                shadow: 'hover:shadow-emerald-200/25'
            },
            {
                bg: 'from-purple-50 to-violet-100',
                border: 'border-purple-200/60',
                hoverBorder: 'hover:border-purple-300',
                labelColor: 'text-purple-800',
                labelHover: 'group-hover:text-purple-900',
                valueColor: 'text-violet-600',
                valueHover: 'group-hover:text-violet-700',
                shadow: 'hover:shadow-purple-200/25'
            },
            {
                bg: 'from-rose-50 to-pink-100',
                border: 'border-rose-200/60',
                hoverBorder: 'hover:border-rose-300',
                labelColor: 'text-rose-800',
                labelHover: 'group-hover:text-rose-900',
                valueColor: 'text-pink-600',
                valueHover: 'group-hover:text-pink-700',
                shadow: 'hover:shadow-rose-200/25'
            },
            {
                bg: 'from-amber-50 to-orange-100',
                border: 'border-amber-200/60',
                hoverBorder: 'hover:border-amber-300',
                labelColor: 'text-amber-800',
                labelHover: 'group-hover:text-amber-900',
                valueColor: 'text-orange-600',
                valueHover: 'group-hover:text-orange-700',
                shadow: 'hover:shadow-amber-200/25'
            },
            {
                bg: 'from-cyan-50 to-sky-100',
                border: 'border-cyan-200/60',
                hoverBorder: 'hover:border-cyan-300',
                labelColor: 'text-cyan-800',
                labelHover: 'group-hover:text-cyan-900',
                valueColor: 'text-sky-600',
                valueHover: 'group-hover:text-sky-700',
                shadow: 'hover:shadow-cyan-200/25'
            }
        ];

        return schemes[Math.floor(Math.random() * schemes.length)];
    }, []);

    return (
        <Link
            to={redirectUrl}
            className={`group block relative overflow-hidden rounded bg-gradient-to-br ${colorScheme.bg} backdrop-blur-sm border ${colorScheme.border} ${colorScheme.hoverBorder} shadow-sm transition-all duration-500 ease-out hover:shadow-xl ${colorScheme.shadow} hover:scale-[1.03] hover:-translate-y-1 p-2`}
        >
            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent  to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

            <div className="relative flex justify-between items-center px-2">
                <h6 className={`text-sm font-medium ${colorScheme.labelColor} ${colorScheme.labelHover} transition-all duration-300`}>
                    {label}
                </h6>

                <div className="text-right">
                    <h6 className={`text-lg font-bold font-mono ${colorScheme.valueColor} ${colorScheme.valueHover} transition-all duration-300 group-hover:scale-105`}>
                        {value}
                    </h6>
                </div>
            </div>

            {/* Bottom accent line */}
            <div className={`h-0.5 bg-gradient-to-r ${colorScheme.bg} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
        </Link>
    );
};

export default PropertyCard;