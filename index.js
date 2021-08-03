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

const { ApolloServer, gql } = require('apollo-server');
const {ApolloGateway} = require('@apollo/gateway')
require('dotenv').config()

const gateway = new ApolloGateway({
    serviceList: [
        { name: 'company', url: `http://${process.env.COMPANY_URL}/graphiql` },
        { name: 'product', url: `http://${process.env.PRODUCT_URL}/graphiql` },
        { name: 'customer', url: `http://${process.env.CUSTOMER_URL}/graphiql` },
    //    { name: 'serialization-profile', url: `http://${process.env.SERIALIZATION_PROFILE}/graphiql` },
        { name: 'serial-number-generator', url: `http://${process.env.SERIAL_NUMBER_GENERATOR_URL}/graphiql`}
    ]
});

const server = new ApolloServer({ gateway, subscriptions:false, tracing:true });
server.listen({port: process.env.HTTP_PORT});
