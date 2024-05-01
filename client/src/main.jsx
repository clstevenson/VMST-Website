import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from './App.jsx';
import ErrorPage from './pages/ErrorPage.jsx';
import EmailPage2 from './pages/EmailPage2.jsx';
import EmailPage from './pages/EmailPage.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <EmailPage />
      },
      {
        path: '/2',
        element: <EmailPage2 />
      }
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
