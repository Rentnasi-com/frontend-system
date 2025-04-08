import React from 'react';

const Button = ({ onClick, children, type = 'button', disabled = false, className = '', variant = 'primary', size = 'md', ...props }) => {
    const baseStyles = 'rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ease-in-out duration-200';
    const variants = {
        primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500',
        secondary: 'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-500',
        danger: 'bg-red-700 hover:bg-red-600 text-white focus:ring-red-700',
        success: 'bg-green-700 hover:bg-green-600 text-white focus:ring-green-700',
    };

    const sizes = {
        xs: 'px-3 py-2 text-xs',
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-3 text-lg',
    };

    return (
        <button
            onClick={onClick}
            type={type}
            disabled={disabled}
            className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
