import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const AuthLayout = ({
    children,
    authentication = true
}) => {
    const [Loadings, setLoadings] = useState(true);

    const { authUser, userLoggedIn, authTokenGet, loading } = useSelector((state) => {
        //get redux Auth data here
        return state.userAuthData;
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (authentication && userLoggedIn !== authentication) {
            navigate("/login");
        } else if (!authentication && userLoggedIn !== authentication) {
            navigate("/");
        }
        setLoadings(false);
    }, [authentication, userLoggedIn, navigate]);


    return Loadings ? <h1>Loading Pages......</h1> : <>{children} </>
}

export default AuthLayout;