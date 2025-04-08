const TextArea = ({ label, name, value, onChange, placeholder = "" }) => {
    return (
        <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">{label}</label>
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:ring focus:ring-blue-300"
            />
        </div>
    );
};

export default TextArea;
