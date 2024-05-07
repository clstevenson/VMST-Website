import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import App from './App.jsx'
import Home from './pages/Home'
import ErrorPage from './pages/ErrorPage'
import Account from './pages/Account'
import Contact from './pages/Contact'
import UploadMembers from './pages/UploadMembers'
import AboutUs from './pages/AboutUs'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />
      }, {
        path: '/about-us',
        element: <AboutUs />
      }, {
        path: '/contact',
        element: <Contact />
      }, {
        path: '/me',
        element: <Account />
      },
      {
        path: '/upload',
        element: <UploadMembers />
      },
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);