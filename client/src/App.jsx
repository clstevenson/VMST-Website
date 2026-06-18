import { ApolloProvider } from "@apollo/client";

import { Outlet } from "react-router-dom";
import GlobalStyles from "../GlobalStyles";
import Banner from "./components/Banner";
import Footer from "./components/Footer";
import Header from "./components/Header";
import styled from "styled-components";
import { COLORS } from "./utils/constants";
import client from "./apolloClient";

function App() {
  return (
    <ApolloProvider client={client}>
      <GlobalStyles />
      <Sidebar />
      <Wrapper>
        <Header />
        {/* Maybe use a global state to turn Banner on/off as needed */}
        {/* Prop is duraction each image is displayed, in sec */}
        <Banner duration={30 * 60} />
        <Main>
          <Outlet />
        </Main>
        <Footer />
      </Wrapper>
      <Sidebar />
    </ApolloProvider>
  );
}

// Wrapper is for all website content
const Wrapper = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${COLORS.white};
  padding: 16px;
`;

const Main = styled.main``;

// container below is meant to be empty, centers the content on wide screens
const Sidebar = styled.div``;

export default App;
