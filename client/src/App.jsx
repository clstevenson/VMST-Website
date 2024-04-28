import './App.css';

// import{
//     ApolloClient,
//     ApolloProvider,
// } from '@apollo/client';

import { Outlet } from 'react-router-dom';

// import Header from './components/Header';
// import Footer from './components/Footer';

function App() {
  return (
    // <ApolloProvider client={client}>
    <div className="">
      {/* <Header /> */}
      <div className="">
        <Outlet />
      </div>
      {/* <Footer /> */}
    </div>
    // </ApolloProvider>
  );
}

export default App;
