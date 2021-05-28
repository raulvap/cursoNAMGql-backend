// --- Importamos el Modelo y más importaciones
const Usuario = require("../models/Usuario");
const Producto = require("../models/Producto");
const Cliente = require("../models/Cliente");
const Pedido = require("../models/Pedidos");

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

//función de creación de Token: (Lesson 29: npm i jsonwebtoken)
const crearToken = (usuario, secret, expiresIn) => {
   const { id, email, nombre, apellido } = usuario;

   return jwt.sign({ id, email, nombre, apellido }, secret, { expiresIn });
};

//Los RESOLVERS van relacionados con el Schema y con los Models
// --- RESOLVERS ---
const resolvers = {
   Query: {
      // ----------- Usuarios: -----------
      obtenerUsuario: async (_, {}, ctx) => {
         return ctx.usuario;
      },

      // ----------- Productos (lesson 34) -----------
      obtenerProductos: async () => {
         try {
            const productos = await Producto.find({});
            return productos;
         } catch (error) {
            console.log(error);
         }
      },
      obtenerProducto: async (_, { id }) => {
         // revisar si el producto con el id existe en la DB:
         const producto = await Producto.findById(id);

         if (!producto) {
            throw new Error("Producto no encontrado (err:p1)");
         }
         return producto;
      },

      // ----------- Clientes (lesson 42) -----------
      obtenerClientes: async () => {
         try {
            const clientes = await Cliente.find({});
            return clientes;
         } catch (error) {
            console.log(error);
         }
      },

      obtenerClientesVendedor: async (_, {}, ctx) => {
         //Lesson 43: solo regresamos los clientes del vendedor
         try {
            const clientes = await Cliente.find({ vendedor: ctx.usuario.id.toString() });
            return clientes;
         } catch (error) {
            console.log(error);
         }
      },

      obtenerCliente: async (_, { id }, ctx) => {
         //Lesson 44
         // revisar si el producto con el id existe en la DB:
         const cliente = await Cliente.findById(id);

         if (!cliente) {
            throw new Error("Cliente no encontrado (err:c1)");
         }

         // Quien crea al cliente, puede verlo solamente
         if (cliente.vendedor.toString() !== ctx.usuario.id) {
            throw new Error("Cliente pertenece a otro usuario (err:c2)");
         }
         return cliente;
      },

      // ----------- PEDIDOS: -----------
      obtenerPedidos: async () => {
         // Lesson 53
         try {
            const pedidos = await Pedido.find({});
            return pedidos;
         } catch (error) {
            console.log(error);
         }
      },
      obtenerPedidosVendedor: async (_, {}, ctx) => {
         // Lesson 53
         try {
            const pedidos = await Pedido.find({ vendedor: ctx.usuario.id });
            return pedidos;
         } catch (error) {
            console.log(error);
         }
      },
      obtenerPedido: async (_, { id }, ctx) => {
         // Lesson 54

         //Verificar si el pediso existe
         const pedido = await Pedido.findById(id);
         if (!pedido) {
            throw new Error("Pedido no encontrado (err: e1)");
         }

         // Solo quien lo creo puede verlo
         if (pedido.vendedor.toString() !== ctx.usuario.id) {
            throw new Error("Cliente pertenece a otro usuario (err:e2)");
         }

         // regresar el resultado.
         return pedido;
      },
      obtenerPedidosEstado: async (_, { estado }, ctx) => {
         // Lesson 57
         // Revisamos el vendedor y el estado:
         const pedidos = await Pedido.find({
            vendedor: ctx.usuario.id,
            estado: estado,
         });

         return pedidos;
      },

      // ----------- BUSQUEDAS AVANZADAS: -----------
      mejoresClientes: async () => {
         // Lesson 58: obteniendo los mejores clientes
         const clientes = await Pedido.aggregate([
            { $match: { estado: "COMPLETADO" } },
            {
               $group: {
                  _id: "$cliente",
                  total: { $sum: "$total" },
               },
            },
            {
               $lookup: {
                  from: "clientes",
                  localField: "_id",
                  foreignField: "id",
                  as: "cliente",
               },
            },
            {
               $limit: 10,
            },
            {
               $sort: { total: -1 },
            },
         ]);

         return clientes;
      },
      mejoresVendedores: async () => {
         // Lesson 59: obteniendo los mejores vendedores
         const vendedores = await Pedido.aggregate([
            { $match: { estado: "COMPLETADO" } },
            {
               $group: {
                  _id: "$vendedor",
                  total: { $sum: "$total" },
               },
            },
            {
               $lookup: {
                  from: "usuarios",
                  localField: "_id",
                  foreignField: "_id",
                  as: "vendedor",
               },
            },
            {
               $limit: 10,
            },
            {
               $sort: { total: -1 },
            },
         ]);
         return vendedores;
      },
      buscarProducto: async (_, { texto }) => {
         //Lesson 60: para buscar un producto
         const productos = await Producto.find({
            $text: { $search: texto },
         });
         return productos;
      },
   },

   Mutation: {
      // --------USUARIOS ---------:
      nuevoUsuario: async (_, { input }) => {
         // destructuring (sacamos) email y password:
         const { email, password } = input;

         // Revisar si el usuario ya está registrado en la DB:
         const existeUsuario = await Usuario.findOne({ email });
         if (existeUsuario) {
            throw new Error("El usuario ya está registrado");
         }

         // Hashear password (lesson 27)
         const salt = await bcryptjs.genSaltSync(10);
         input.password = await bcryptjs.hashSync(password, salt);

         // Guadar en la base de datos
         try {
            const usuario = new Usuario(input);
            usuario.save();
            return usuario;
         } catch (error) {
            console.log(error);
         }
      },

      autenticarUsuario: async (_, { input }) => {
         const { email, password } = input;

         // Si el usuario existe:
         const existeUsuario = await Usuario.findOne({ email });
         if (!existeUsuario) {
            throw new Error("El usuario o contraseña está incorrecto (err: 01b)");
         }

         // Revisar si el password es correcto
         const passwordCorrecto = await bcryptjs.compareSync(password, existeUsuario.password);
         if (!passwordCorrecto) {
            throw new Error("El usuario o contraseña está incorrecto (err: 01a)");
         }

         // Crear el Token: lesson 29
         return {
            token: crearToken(existeUsuario, process.env.SECRET, "2d"),
         };
      },

      // --------PRODUCTOS ---------: (lesson 33)
      nuevoProducto: async (_, { input }) => {
         try {
            const producto = new Producto(input);

            // Guadar en la DB:
            const resultado = await producto.save();

            return resultado;
         } catch (error) {
            console.log(error);
         }
      },
      // Actualizar producto: (lesson 36) del schema, definimos los inputs:
      actualizarProducto: async (_, { id, input }) => {
         // revisar si el producto existe en la db
         let producto = await Producto.findById(id);

         if (!producto) {
            throw new Error("Producto no encontrado (err:p1");
         }

         //guardar el producto actualizado
         producto = await Producto.findOneAndUpdate({ _id: id }, input, { new: true });

         return producto;
      },
      // Eliminar producto: (lesson 37)
      eliminarProducto: async (_, { id }) => {
         // revisar si el producto existe en la db
         let producto = await Producto.findById(id);

         if (!producto) {
            throw new Error("Producto no encontrado (err:p1)");
         }

         //Eliminar:
         await Producto.findOneAndDelete({ _id: id });
         return "Producto eliminado";
      },

      // -------- CLIENTES ---------: (lesson 40)
      nuevoCliente: async (_, { input }, ctx) => {
         const { email } = input;
         const cliente = new Cliente(input);

         // Verificar si el cliente ya está registrado
         const clienteExiste = await Cliente.findOne({ email });

         if (clienteExiste) {
            throw new Error("El cliente ya está registrado");
         }

         // Asignar el vendedor (lesson 41: el id viene el ctx)
         cliente.vendedor = ctx.usuario.id;

         // Guardarlo en la base de datos
         try {
            const resultado = await cliente.save();
            return resultado;
         } catch (error) {
            console.log(error);
         }
      },

      actualizarCliente: async (_, { id, input }, ctx) => {
         // Lesson 45:
         const { email } = input;

         // verificar si existe o no
         let cliente = await Cliente.findById(id);
         if (!cliente) {
            throw new Error("Cliente no encontrado (err:c1");
         }

         // Verificar si el vendedor es quién edita:
         if (cliente.vendedor.toString() !== ctx.usuario.id) {
            throw new Error("Cliente pertenece a otro usuario (err:c2)");
         }

         // Guardar el cliente actualizado
         cliente = await Cliente.findByIdAndUpdate({ _id: id }, input, { new: true });
         return cliente;
      },

      eliminarCliente: async (_, { id }, ctx) => {
         //Lesson 46
         // revisar si el cliente existe en la db
         let cliente = await Cliente.findById(id);

         if (!cliente) {
            throw new Error("Cliente no encontrado (err:c1)");
         }

         // Verificar si el vendedor es quién elimina:
         if (cliente.vendedor.toString() !== ctx.usuario.id) {
            throw new Error("Cliente pertenece a otro usuario (err:c2)");
         }

         //Eliminar:
         await Cliente.findOneAndDelete({ _id: id });
         return "Cliente eliminado";
      },

      // -------- PEDIDOS ---------: (lesson 49)
      nuevoPedido: async (_, { input }, ctx) => {
         // Lesson 49:
         const { cliente } = input;

         // Verificar si existe o no
         let clienteExiste = await Cliente.findById(cliente);

         if (!clienteExiste) {
            throw new Error("Cliente no encontrado (err:c1)");
         }

         // Verificar si el cliente es del vendedor
         if (clienteExiste.vendedor.toString() !== ctx.usuario.id) {
            throw new Error("Cliente pertenece a otro usuario (err:c2)");
         }

         // Revisar que haya stock disponible
         // Lesson 50:
         for await (const articulo of input.pedido) {
            const { id } = articulo;
            const producto = await Producto.findById(id);

            if (articulo.cantidad > producto.existencia) {
               throw new Error(`El artículo ${producto.nombre} excede la cantidad disponible`);
            } else {
               // Lesson 51:
               // Restar la cantidad del pedido a lo que está disponible
               producto.existencia = producto.existencia - articulo.cantidad;
               await producto.save();
            }
         }

         //Crear un nuevo pedido:
         // Lesson 51:
         const nuevoPedido = new Pedido(input);

         // Asignarle un vendedor
         nuevoPedido.vendedor = ctx.usuario.id;

         // Guardarlo en la DB
         const resultado = await nuevoPedido.save();
         return resultado;
      },
      actualizarPedido: async (_, { id, input }, ctx) => {
         //Lesson 55
         const { cliente } = input;
         // Revisar si el pedido existe
         const existePedido = await Pedido.findById(id);
         if (!existePedido) {
            throw new Error("Pedido no encontrado (err: e1)");
         }

         // Revisar si el cliente existe
         const existeCliente = await Cliente.findById(id);
         if (!existeCliente) {
            throw new Error("Cliente no encontrado (err: c1)");
         }

         // Revisar si el cliente y el pedido pertenecen al vendedor
         if (
            existePedido.vendedor.toString() !== ctx.usuario.id ||
            existeCliente.vendedor.toString() !== ctx.usuario.id
         ) {
            throw new Error("Pedido pertenece a otro usuario (err:e2)");
         }

         // Revisar el stock
         if (input.pedido) {
            for await (const articulo of input.pedido) {
               const { id } = articulo;
               const producto = await Producto.findById(id);

               if (articulo.cantidad > producto.existencia) {
                  throw new Error(`El artículo ${producto.nombre} excede la cantidad disponible`);
               } else {
                  // Lesson 51:
                  // Restar la cantidad del pedido a lo que está disponible
                  producto.existencia = producto.existencia - articulo.cantidad;
                  await producto.save();
               }
            }
         }

         // Guardar el pedido
         const resultado = await Pedido.findOneAndUpdate({ _id: id }, input, { new: true });
         return resultado;
      },

      eliminarPedido: async (_, { id }, ctx) => {
         // Lesson 56
         // Verificar si el pedido existe
         const pedido = await Pedido.findById(id);
         if (!pedido) {
            throw new Error("Pedido no encontrado (err: e1)");
         }

         // Verificar si el vendedor es quien lo borra
         if (pedido.vendedor.toString() !== ctx.usuario.id) {
            throw new Error("Pedido pertenece a otro usuario (err:e2)");
         }

         // Actualizar inventario disponible To Do

         // Eliminar el pedido de la base de datos
         await Pedido.findOneAndDelete({ _id: id });
         return "Pedido eliminado";
      },
   },
};

module.exports = resolvers;
