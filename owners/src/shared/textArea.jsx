const TextArea = ({ label, name, value, onChange, placeholder = "" ,otherStyles }) => {
    return (
        <div className={`${otherStyles} my-4`}>
            <label className="block text-gray-500 font-semibold mb-1 text-sm">{label}</label>
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={` w-full border border-gray-300 rounded px-4 py-2 focus:ring focus:ring-blue-300`}
            />
        </div>
    );
};

export default TextArea;
