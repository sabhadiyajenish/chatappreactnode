import Reactm, { memo } from 'react'

const Simple = ({ fun, couterData }) => {
    // console.log("Simple component rerender");
    const data = fun();
    return (
        <div><h4>{data?.name + "roll no " + data?.rollNo}</h4></div>
    )
}

export default memo(Simple);