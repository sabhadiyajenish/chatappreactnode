import Home from "./pages/home/home";
import Login from "./pages/login/login";
import Service from "./pages/service/service";
import Contact from "./pages/contact/contact";
import User from "./pages/user/user";
import Register from "./pages/register/register.jsx";
import withAuth from "./component/AuthLayout.jsx";
import { createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import About from "./pages/about/about.jsx";
const AuthHome = withAuth(Home, false);
const AuthService = withAuth(Service, true);
const AuthUser = withAuth(User, true);
const AuthLogin = withAuth(Login, false);
const AuthRegister = withAuth(Register, false);

export const Router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <AuthHome /> },
      { path: "/login", element: <AuthLogin /> },
      { path: "/register", element: <AuthRegister /> },
      { path: "/service", element: <AuthService /> },
      { path: "/contact", element: <Contact /> },
      { path: "/user", element: <AuthUser /> },
      { path: "/about", element: <About /> },

      { path: "*", element: <div>No page found plz go home page!</div> },
    ],
  },
]);
