const TextArea = ({ label, name, value, onChange, placeholder = "", otherStyles, error, register }) => {
    return (
        <div className={`${otherStyles} mb-3`}>
            <label className="block text-gray-500 font-semibold mb-1 text-sm">{label}</label>
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                {...register(name)}
                placeholder={placeholder}
                className={`w-full h-32 px-3 py-2 border rounded text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 ${error ? "border-red-500" : "border-gray-300"
                    }`}
            />
        </div>
    );
};

export default TextArea;
