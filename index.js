/*
 * Copyright 2020 Netflix, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { ApolloServer } = require('apollo-server-express');
const {ApolloGateway,RemoteGraphQLDataSource} = require('@apollo/gateway')
const { configureKeycloak } = require('./lib/common')
const {
  KeycloakContext,
  KeycloakTypeDefs,
  KeycloakSchemaDirectives
} = require('keycloak-connect-graphql')
const express = require('express')
const cors = require("cors")
const expressPlayground = require('graphql-playground-middleware-express').default;
require('dotenv').config()

const app = express()
const graphqlPath = '/graphql';

const gateway = new ApolloGateway({
    serviceList: [
        { name: 'company', url: `http://${process.env.COMPANY_URL}/graphql` },
        { name: 'product', url: `http://${process.env.PRODUCT_URL}/graphql` },
        { name: 'customer', url: `http://${process.env.CUSTOMER_URL}/graphiql` },
        { name: 'serialization-profile', url: `http://${process.env.SERIALIZATION_PROFILE}/graphiql` }
//        { name: 'serial-number-generator', url: `http://${process.env.SERIAL_NUMBER_GENERATOR_URL}/graphiql`}
        // Editing it to trigger the build 
    ],
    buildService({ name, url }) {
     return new RemoteGraphQLDataSource({
        url,
        willSendRequest({ request, context }) {
           const headers = context.req.headers
            console.log(`Headers => ${headers}`);
            for (const key in headers) {
                const value = headers[key];
                console.log(`${key} => ${value} `);
                if (value) {
                    request.http?.headers.set(key, String(value));
                }
            }
        }
      })
    },
    // Experimental: Enabling this enables the query plan view in Playground.
    __exposeQueryPlanExperimental: false,
  });

(async () => {
  // perform the standard keycloak-connect middleware setup on our app
  const { keycloak } = configureKeycloak(app, graphqlPath);

  // Ensure entire GraphQL Api can only be accessed by authenticated users
  function allowAll(token, request) {
     return true;
    }

  app.use(graphqlPath, keycloak.protect(allowAll));

  const server = new ApolloServer({
    gateway,

    // Apollo Graph Manager (previously known as Apollo Engine)
    // When enabled and an `ENGINE_API_KEY` is set in the environment,
    // provides metrics, schema management and trace reporting.
    engine: false,

    // Subscriptions are unsupported but planned for a future Gateway version.
    subscriptions: false,

    // Disable default playground
    playground: false,

    context: ({ req }) => {
      return {
        kauth: new KeycloakContext({ req })
      }
    }
  });


server.applyMiddleware({ app })
app.listen( {port: process.env.HTTP_PORT} , () => {
  console.log(`🚀 Server ready at http://localhost:${process.env.HTTP_PORT}${graphqlPath}`)
  })
 })();