import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/home/home";
import Login from "./pages/login/login";
import Service from "./pages/service/service";
import Contact from "./pages/contact/contact";
import User from "./pages/user/user";
import App from "./App.jsx";
import Register from "./pages/register/register.jsx";
import AuthLayout from "./component/AuthLayout.jsx";

export const Router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: (
          <AuthLayout authentication>
            <Home />
          </AuthLayout>),
      },
      {
        path: "/login",
        element: (
          <AuthLayout authentication={false}>
            <Login />
          </AuthLayout>),
      },
      {
        path: "/register",
        element: (
          <AuthLayout authentication={false}>
            <Register />
          </AuthLayout>),
      },
      {
        path: "/service",
        element: <Service />,
      }, {
        path: "/about",
        element: <div>Hello about page!</div>,
      },
      {
        path: "/contact",
        element: <Contact/>,
      },
      {
        path: "/user",
        element: (
          <AuthLayout authentication>
            <User />
          </AuthLayout>),
      },
      {
        path: "*",
        element: <div>No page found plz go home page!</div>,
      },
    ]
  }

]);

