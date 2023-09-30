import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import {resolvers} from "./schema/resolvers.js";
import {typeDefs} from "./schema/schema.js";


const server = new ApolloServer({typeDefs , resolvers})


const {url} = await startStandaloneServer(server , {
    listen :{port : 4000}
})


console.log(`server ready at port 4000`);
