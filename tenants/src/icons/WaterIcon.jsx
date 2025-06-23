const WaterDropIcon = ({ className = "h-6 w-6", strokeWidth = 1.5 }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className={className}
        strokeWidth={strokeWidth}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2c-3.31 0-6 2.69-6 6 0 3.5 6 10 6 10s6-6.5 6-10c0-3.31-2.69-6-6-6zm0 16h.01"
        />
    </svg>
);

export default WaterDropIcon;