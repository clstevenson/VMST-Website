const express = require('express');
// Import the ApolloServer class
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { authMiddleware } = require('./utils/auth');

// Import the two parts of a GraphQL schema
const { typeDefs, resolvers } = require('./schemas');

const path = require('path');
const db = require('./config/connection');

const app = express();
const PORT = process.env.PORT || 3001;
const server = new ApolloServer({ typeDefs, resolvers });

// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async () => {
  // start up the Apollo server
  await server.start();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json({ limit: '50mb' }));

  // assign a route for the Apollo server sandbox
  // the JWT token is validated as part of the context
  app.use('/graphql', expressMiddleware(server, {
    context: authMiddleware
  }));

  // if we're in production, serve client/dist as static assets
  // serve index.html by default (this is a SPA)
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    })
  }

  // this part is Mongoose connecting to the database
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

// Call the async function to start the server
startApolloServer();
