import { ApolloProvider } from "@apollo/client";

import { Outlet } from "react-router-dom";
import GlobalStyles from "../GlobalStyles";
import Banner from "./components/Banner";
import Footer from "./components/Footer";
import Header from "./components/Header";
import styled from "styled-components";
import { COLORS } from "./utils/constants";
import client from "./apolloClient";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
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
      </AuthProvider>
    </ApolloProvider>
  );
}

// Wrapper is for all website content
const Wrapper = styled.div`
  /* min-height: 100vh (not 100%) so this doesn't depend on html/body/#root's
     own height resolving correctly -- it's a known source of reflow-timing
     glitches across nested percentage heights + grid/flex, e.g. the footer
     not snapping back up after closing an Accordion. */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${COLORS.white};
  padding: 16px;
`;

// grows to fill any leftover space in Wrapper, pushing Footer to the
// bottom of the viewport on short pages, without shrinking below its own
// content on tall pages (which would clip content)
const Main = styled.main`
  flex: 1 0 auto;
`;

// container below is meant to be empty, centers the content on wide screens
const Sidebar = styled.div``;

export default App;
