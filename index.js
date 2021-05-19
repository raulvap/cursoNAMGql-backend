require("dotenv").config();
// --- IMPORTACIONES ---
const { ApolloServer } = require("apollo-server");
const typeDefs = require("./db/schema");
const resolvers = require("./db/resolver");

const conectarDB = require("./config/db");

// --- BASE DE DATOS ---
conectarDB();

// --- SERVIDOR ---
const server = new ApolloServer({
   typeDefs,
   resolvers,
});

// --- Iniciar el servidor: ---
server.listen().then(({ url }) => {
   console.log("*******************************************");
   console.log(`Servidor listo en la URL: ${url}`);
   console.log("-------------------------------------------");
});
