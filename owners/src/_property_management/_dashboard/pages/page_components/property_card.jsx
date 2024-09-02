import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const PropertyCard = ({ title, total, iconUrl, percentChange, redirectUrl }) => {
    const isPositiveChange = percentChange > 0;
    const changeColor = isPositiveChange ? 'green' : 'red';

    return (
        <Link to={`${redirectUrl}`} className="bg-white shadow rounded-xl p-4 space-y-1">
            <div className="flex justify-between items-center">
                <div className={`border border-${changeColor}-600 rounded-full w-6 h-6`}>
                    {iconUrl ? (
                        <img src={iconUrl} alt="Icon" className="w-full h-full object-cover" />
                    ) : (
                        <div className={`bg-${changeColor}-600 w-full h-full rounded-full`}></div>
                    )}
                </div>
                <div>
                    <img src="assets/icons/svg/dots.svg" alt="Menu" />
                </div>
            </div>
            <div>
                <p className="leading-none font-semibold text-gray-600">{title}</p>
            </div>
            <div className="flex justify-between items-center">
                <h3 className="text-base font-normal text-gray-500">{total}</h3>
                <div className="flex space-x-1 items-center">
                    <div className={`bg-${changeColor}-200 rounded p-1 font-semibold text-xs flex items-center space-x-1`}>
                        <div className={`rounded-full bg-${changeColor}-500 p-1 h-0.5 border border-${changeColor}-400`}></div>
                        <p className="text-xs">{percentChange}%</p>
                    </div>
                    <div className="mt-1">
                        <h3 className="text-xs font-normal text-gray-500">Last Month</h3>
                    </div>
                </div>
            </div>
        </Link>
    );
};

PropertyCard.propTypes = {
    title: PropTypes.string.isRequired,
    total: PropTypes.number.isRequired,
    iconUrl: PropTypes.string,
    percentChange: PropTypes.number.isRequired,
};

PropertyCard.defaultProps = {
    iconUrl: '',
};

export default PropertyCard;
