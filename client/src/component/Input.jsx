import React, { useId } from "react";

const Input = (
  {
    type = "text",
    label,
    labelClassName = "",
    placeholder = "Search",
    className = "",
    autocomplete = "false",
    ...items
  },
  ref
) => {
  const id = useId();
  return (
    <div className="w-full">
      {label && (
        <label
          className={`block text-gray-700 dark:text-white ${labelClassName}`}
          htmlFor={label}
        >
          {label} :
        </label>
      )}
      <input
        type={type}
        id={id}
        ref={ref}
        placeholder={placeholder}
        autoComplete={autocomplete}
        className={`${className}`}
        {...items}
      />
    </div>
  );
};

export default React.forwardRef(Input);
