import PropTypes from "prop-types";

const RadioGroup = ({ label, name, options, register, error }) => {
  return (
    <div className="space-y-2">
      <h6 className="text-sm font-medium text-gray-900">{label}</h6>
      <div className="flex space-x-6 items-center">
        {options.map((option) => (
          <label key={option.value} className="flex items-center space-x-2">
            <input
              type="radio"
              value={option.value}
              {...register(name)}
              className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-2 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
};

RadioGroup.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  register: PropTypes.func.isRequired,
  error: PropTypes.object,
};

export default RadioGroup;
