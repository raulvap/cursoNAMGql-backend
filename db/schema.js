//Aqui pondremos todos los schemas que se usan, recordar que va relacionado con los resolvers
const { gql } = require("apollo-server");

// Query es cuando haces consultas a la Base de Datos, en CRUD es: R,read = get o select
// Mutation es para hacer modificaciones: create, update, delete
// Debemos crear el type de qué va a crear/consultar, es cómo nos va a regresar el dato
//**No existe tipo DATE en graphQL, debe ser string */
// Tipos de datos en GraphQL: String, Int, Float, Boolean

// FORMA: TYPE, INPUT, QUERY MUTATION

const typeDefs = gql`
   # --------- TYPES: ---------
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

   # Type: es cómo nos va a regresar la consulta de los query's: (lesson 32 )
   type Producto {
      id: ID
      nombre: String
      existencia: Int
      precio: Float
      creado: String
   }

   type Cliente {
      id: ID
      nombre: String
      apellido: String
      empresa: String
      email: String
      telefono: String
      vendedor: ID
   }

   type Pedido {
      # Lesson 48
      id: ID
      pedido: [PedidoGrupo]
      total: Float
      cliente: ID
      vendedor: ID
      fecha: String
      estado: EstadoPedido
   }

   type PedidoGrupo {
      # definimos qué info va dentro del array de cada pedido:
      id: ID
      cantidad: Int
      nombre: String
      precio: Float
   }

   type TopCliente {
      # Lesson 58: el tipo de TopCliente que vamos a regresar:
      total: Float
      cliente: [Cliente]
   }

   type TopVendedor {
      # Lesson 59: el tipo de TopVendedor que vamos a regresar:
      total: Float
      vendedor: [Usuario]
   }

   # --------- INPUTS: ---------
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

   input ClienteInput {
      nombre: String!
      apellido: String!
      empresa: String!
      email: String!
      telefono: String
   }

   input PedidoProductoInput {
      # Lesson 48: en el modelo, pedido es un array, por lo que en el schema lo definimos con el tipo de información que va dentro de ese array
      # este tipo de input, lo usamos más abajo
      id: ID
      cantidad: Int
      nombre: String
      precio: Float
   }

   input PedidoInput {
      # Lesson 48: el pedido es un arreglo, definido más arriba:
      pedido: [PedidoProductoInput]
      total: Float
      cliente: ID
      estado: EstadoPedido
   }

   enum EstadoPedido {
      # Lesson 48: del input PedidoInput, solo estos 3 strings se le pueden asignar a estado:
      PENDIENTE
      COMPLETADO
      CANCELADO
   }

   # --------- QUERYS: ---------
   type Query {
      # función : lo que nos regresa (tipado), después definimos igualmente el resolver
      obtenerUsuario: Usuario

      # PRODUCTOS (lesson 34)
      obtenerProductos: [Producto]
      obtenerProducto(id: ID!): Producto

      # CLIENTES (Lesson 42, 43, 44)
      obtenerClientes: [Cliente]
      obtenerClientesVendedor: [Cliente]
      obtenerCliente(id: ID!): Cliente

      # PEDIDOS: (lesson 52, 53, 54, 57)
      obtenerPedidos: [Pedido]
      obtenerPedidosVendedor: [Pedido]
      obtenerPedido(id: ID!): Pedido
      obtenerPedidosEstado(estado: String!): [Pedido]

      # BUSQUEDAS AVANZADAS (lesson 58, 59, 60)
      mejoresClientes: [TopCliente]
      mejoresVendedores: [TopVendedor]
      buscarProducto(texto: String!): [Producto]
   }

   # --------- MUTATIONS: ---------
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

      # CLIENTES (sección 10)
      nuevoCliente(input: ClienteInput): Cliente
      actualizarCliente(id: ID!, input: ClienteInput): Cliente
      eliminarCliente(id: ID!): String

      # PEDIDOS (sección 11)
      nuevoPedido(input: PedidoInput): Pedido
      actualizarPedido(id: ID!, input: PedidoInput): Pedido
      eliminarPedido(id: ID!): String
   }
`;

// tanto los query's como los mutation, deben ir replicados en los resolvers
module.exports = typeDefs;
