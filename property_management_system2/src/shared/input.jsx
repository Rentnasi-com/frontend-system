const Input = ({ label, type = "text", name, placeholder = "", register,
  error, ariaLabel, otherStyles, ...rest
}) => (
  <div className= {`${otherStyles}`}>
    {label && (
      <label htmlFor={name} className="block text-sm font-medium text-gray-500 mb-1">
        {label}
      </label>
    )}
    <input
      aria-label={ariaLabel || name}
      {...register(name)}
      type={type}
      name={name}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border rounded text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 ${
        error ? "border-red-500" : "border-gray-300"
      }`}
      {...rest}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
  </div>
);


export default Input;
