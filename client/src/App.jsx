import './App.css';

import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="">
      <div className="">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
