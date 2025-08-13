import React,{useId} from "react";

function Button({
    children,
    type='button',
    textColor='',
    bgColor='',
    className='',
    ...props
},ref)
{
    const id=useId();
    return (
        <button className={`w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className} ${bgColor} ${textColor}`} id={id} {...props}>
            {children}
        </button>
    )
}

export default React.forwardRef(Button)