// --- Importamos el Modelo y más importaciones
const Usuario = require("../models/Usuario");
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
      obtenerUsuario: async (_, { token }) => {
         const usuarioId = await jwt.verify(token, process.env.SECRET);

         return usuarioId;
      },
   },

   Mutation: {
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
            token: crearToken(existeUsuario, process.env.SECRET, "24h"),
         };
      },
   },
};

module.exports = resolvers;
