import React, { useId } from 'react'

const Select = ({
    options,
    label,
    className,
    labelClassName = "",
    optionClassName = "",
    ...items
}, ref) => {
    const id = useId();
    return (
        <div className='w-full'>
            {label && <label className={`${labelClassName}`}>{label}</label>}
            <select
                id={id}
                className={`${className} px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full`}
                ref={ref}
                {...items}
            >
                {options?.map((data) => {
                    return <option className={`${optionClassName}`} key={data} value={data}>{data}</option>
                })}
            </select>
        </div>
    )
}

export default React.forwardRef(Select);