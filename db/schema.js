//Aqui pondremos todos los schemas que se usan, recordar que va relacionado con los resolvers
const { gql } = require("apollo-server");

// Query es cuando haces consultas a la Base de Datos, en CRUD es: R,read = get o select
// Mutation es para hacer modificaciones: create, update
// Debemos crear el type de qué va a crear/consultar
//**No existe tipo DATE en graphQL, debe ser string */

const typeDefs = gql`
   type Usuario {
      id: ID
      nombre: String
      apellido: String
      email: String
      creado: String
   }

   # Definimos el token para autenticar usuarios (Lesson 28)
   type Token {
      token: String
   }

   # definimos los inputs que va a mandar el usuario: (con ! se hacen obligatorios)
   input UsuarioInput {
      nombre: String!
      apellido: String!
      email: String!
      password: String!
   }

   # Inputs del usuario cuando inicia sesión que se van a autenticar
   input AutenticarInput {
      email: String!
      password: String!
   }

   type Query {
      # función : lo que nos regresa (tipado), después definimos igualmente el resolver
      obtenerUsuario(token: String): Usuario
   }

   type Mutation {
      # creamos el mutation con el input que creamos arriba:
      nuevoUsuario(input: UsuarioInput): Usuario
      # nos regresa el usuario, con la información que definimos en type Usuario (no regresa el password) Lesson 26

      # Creamos otro mutation, para autenticar usuarios cuando inicien sesión, que regresa Token
      autenticarUsuario(input: AutenticarInput): Token
   }
`;

// tanto los query's como los mutation, deben ir replicados en los resolvers
module.exports = typeDefs;
