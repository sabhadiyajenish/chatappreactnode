import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const withAuth = (WrappedComponent, authentication = true) => {
  return (props) => {
    const [loading, setLoading] = useState(true);
    const { userLoggedIn } = useSelector((state) => state.counter);
    const navigate = useNavigate();

    useEffect(() => {
      const checkAuth = () => {
        if (authentication && !userLoggedIn) {
          navigate("/login");
        } else if (!authentication && userLoggedIn) {
          navigate("/");
          setLoading(false);
        } else {
          setLoading(false);
        }
      };

      checkAuth();
    }, [authentication, userLoggedIn, navigate]);

    if (loading) {
      return <div>Loading...</div>; // Or any loading component you prefer
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
