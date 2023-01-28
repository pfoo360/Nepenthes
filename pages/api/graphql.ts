import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import graphql from "../../graphql/index";
import prisma from "../../lib/prisma";

const server = new ApolloServer({
  resolvers: graphql.resolvers,
  typeDefs: graphql.typeDefs,
});

export default startServerAndCreateNextHandler(server, {
  context: async (req, res) => ({ req, res, prisma }),
});
