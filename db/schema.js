//Aqui pondremos todos los schemas que se usan, recordar que va relacionado con los resolvers
const { gql } = require("apollo-server");

const typeDefs = gql`
   type Query {
      # función : lo que nos regresa (tipado), después definimos igualmente el resolver
      obtenerCursos: String
   }
`;

module.exports = typeDefs;
