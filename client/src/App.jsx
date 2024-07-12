import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

import { Outlet } from "react-router-dom";
import GlobalStyles from "../GlobalStyles";
import Banner from "./components/Banner";
import Footer from "./components/Footer";
import Header from "./components/Header";
import styled from "styled-components";

const httpLink = createHttpLink({ uri: "/graphql" });

// Construct request middleware that will attach the JWT token to every request as an `authorization` header
const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem("id_token");
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <GlobalStyles />
      <Wrapper>
        <Header />
        {/* Maybe use a global state to turn Banner on/off as needed */}
        {/* Prop is duraction each image is displayed, in sec */}
        <Banner duration={5 * 60} />
        <main>
          <Outlet />
        </main>
        <Footer />
      </Wrapper>
    </ApolloProvider>
  );
}

const Wrapper = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
`;

export default App;
