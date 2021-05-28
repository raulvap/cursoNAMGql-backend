require("dotenv").config();
// --- IMPORTACIONES ---
const { ApolloServer } = require("apollo-server");
const jwt = require("jsonwebtoken");
const typeDefs = require("./db/schema");
const resolvers = require("./db/resolver");

const conectarDB = require("./config/db");

// --- BASE DE DATOS ---
conectarDB();

// --- SERVIDOR ---
const server = new ApolloServer({
   typeDefs,
   resolvers,
   // Lesson 41: usando context para asignarle el vendedor al cliente:
   context: ({ req }) => {
      const token = req.headers["authorization"] || "";

      if (token) {
         try {
            const usuario = jwt.verify(token.replace("Bearer ", ""), process.env.SECRET);

            return {
               usuario,
            };
         } catch (error) {
            console.log("Error en TokenIndex:", error);
         }
      }
   },
});

// --- Iniciar el servidor: ---
server.listen().then(({ url }) => {
   console.log("*******************************************");
   console.log(`Servidor listo en la URL: ${url}`);
   console.log("-------------------------------------------");
});
