import { GraphQLContext } from "./../../types/types";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import graphql from "../../graphql/index";
import prisma from "../../lib/prisma";
import getServerSessionAndUser from "../../utils/getServerSessionAndUser";

const server = new ApolloServer<GraphQLContext>({
  resolvers: graphql.resolvers,
  typeDefs: graphql.typeDefs,
});

export default startServerAndCreateNextHandler(server, {
  context: async (req, res) => {
    const sessionAndUser = await getServerSessionAndUser(req, res);

    if (!sessionAndUser) return { req, res, prisma, session: null, user: null };

    return {
      req,
      res,
      prisma,
      session: sessionAndUser.sessionToken,
      user: sessionAndUser.user,
    };
  },
});
