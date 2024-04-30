import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import App from './App.jsx'
import Home from './pages/Home'
import SingleThought from './pages/SingleThought'
import ErrorPage from './pages/ErrorPage'
import AboutUs from './pages/AboutUs.jsx'
import Account from './pages/Account'
import ContactUs from './pages/ContactUs'

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
        path: '/contact-us',
        element: <ContactUs />
      }, {
        path: '/me',
        element: <Account />
      }, {
        path: '/thoughts/:thoughtId',
        element: <SingleThought />
      }
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
