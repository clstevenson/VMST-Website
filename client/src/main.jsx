import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from './App.jsx';
import ErrorPage from './pages/ErrorPage.jsx';
import EmailPage from './pages/EmailPage.jsx';
import UploadMembers from './pages/UploadMembers';

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
        path: '/upload',
        element: <UploadMembers />
      }
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
