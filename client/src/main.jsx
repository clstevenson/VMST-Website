import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";
import Home from "./pages/Home";
import ErrorPage from "./pages/ErrorPage";
import Gallery from "./pages/Gallery";
import Account from "./pages/Account";
import Contact from "./pages/Contact";
import AboutUs from "./pages/AboutUs";
import SinglePost from "./pages/SinglePost.jsx";
import CreateEditPost from "./pages/CreateEditPost.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/post/:id",
        element: <SinglePost />,
      },
      {
        path: "/post/create",
        element: <CreateEditPost />,
      },
      {
        path: "/post/:postId/edit",
        element: <CreateEditPost isEditing={true} />,
      },
      {
        path: "/about-us",
        element: <AboutUs />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/me",
        element: <Account />,
      },
      {
        path: "/gallery",
        element: <Gallery />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
