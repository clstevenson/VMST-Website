import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  Observable,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import AuthService from "./utils/auth.js";

const httpLink = createHttpLink({ uri: "/graphql" });

const authLink = setContext((_, { headers }) => {
  const token = AuthService.getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors?.some((e) => e.extensions?.code === "UNAUTHENTICATED")) {
    return new Observable((observer) => {
      AuthService.refreshAccessToken().then((token) => {
        if (!token) {
          observer.error(new Error("Session expired"));
          return;
        }
        operation.setContext(({ headers }) => ({
          headers: { ...headers, authorization: `Bearer ${token}` },
        }));
        forward(operation).subscribe(observer);
      });
    });
  }
});

const client = new ApolloClient({
  link: errorLink.concat(authLink).concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
