//Aqui pondremos todos los schemas que se usan, recordar que va relacionado con los resolvers
const { gql } = require("apollo-server");

// Query es cuando haces consultas a la Base de Datos, en CRUD es: R,read = get o select
// Mutation es para hacer modificaciones: create, update, delete
// Debemos crear el type de qué va a crear/consultar, es cómo nos va a regresar el dato
//**No existe tipo DATE en graphQL, debe ser string */
// Tipos de datos en GraphQL: String, Int, Float, Boolean

// FORMA: TYPE, INPUT, QUERY MUTATION

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

   # Type: es cómo nos va a regresar la consulta de producto: (lesson 32 )
   type Producto {
      id: ID
      nombre: String
      existencia: Int
      precio: Float
      creado: String
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

   input ProductoInput {
      nombre: String!
      existencia: Int!
      precio: Float!
   }

   type Query {
      # función : lo que nos regresa (tipado), después definimos igualmente el resolver
      obtenerUsuario(token: String): Usuario

      #Productos: (lesson 34)
      obtenerProductos: [Producto]
      obtenerProducto(id: ID!): Producto
   }

   type Mutation {
      # USUARIOS
      # creamos el mutation con el input que creamos arriba:
      nuevoUsuario(input: UsuarioInput): Usuario
      # nos regresa el usuario, con la información que definimos en type Usuario (no regresa el password) Lesson 26

      # Creamos otro mutation, para autenticar usuarios cuando inicien sesión, que regresa Token
      autenticarUsuario(input: AutenticarInput): Token

      # PRODUCTOS (sección 9)
      nuevoProducto(input: ProductoInput): Producto
      actualizarProducto(id: ID!, input: ProductoInput): Producto
      eliminarProducto(id: ID!): String
   }
`;

// tanto los query's como los mutation, deben ir replicados en los resolvers
module.exports = typeDefs;
