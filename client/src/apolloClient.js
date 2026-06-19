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

// these mutations are unauthenticated by design: an UNAUTHENTICATED error
// from them means "the credentials just submitted are wrong," not "the
// session's access token expired," so they must not trigger a silent
// refresh + logout/redirect.
const UNAUTHENTICATED_EXEMPT_OPS = ["login", "addUser"];

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (
    !UNAUTHENTICATED_EXEMPT_OPS.includes(operation.operationName) &&
    graphQLErrors?.some((e) => e.extensions?.code === "UNAUTHENTICATED")
  ) {
    return new Observable((observer) => {
      AuthService.refreshAccessToken().then((token) => {
        if (!token) {
          AuthService.logout();
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
