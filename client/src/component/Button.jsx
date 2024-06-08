import React from 'react'

const Button = ({ children,
    type = "button",
    className = "",
    ...items
}) => {
    return (
        <button className={`${className}`}
            type={type}  {...items}>
            {children ? children : "Click"}
        </button>
    )
}

export default Button;