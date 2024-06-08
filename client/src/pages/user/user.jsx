import React, { useEffect } from 'react';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const User = () => {

    const navigate = useNavigate();

    const { authUser, authTokenGet, loading } = useSelector((state) => {
        //get redux data here
        return state.userAuthData;
    });

    // useEffect(() => {
    //     if (authTokenGet == "") {
    //         navigate("/login");
    //     }
    // }, [authTokenGet])
    return (
        <>
            {
                loading ? <h1>Loading Data..............................</h1> : <>


                    <h1>Email:- {authUser?.email}</h1>
                    <h1>userName:- {authUser?.userName}</h1>
                    <h1>fullName:- {authUser?.fullName}</h1>

                    <img src={authUser?.avatar} alt='sssfgsgg' height={300} width={300} />


                </>
            }
        </>
    )
}

export default User;