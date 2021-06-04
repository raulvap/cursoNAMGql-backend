// Configuración de la Base de Datos

const mongoose = require("mongoose");
const IP_SERVER = process.env.IP_SERVER;
const PORT_DB = process.env.PORT_DB;

//Nota: Cambiar DB_DEMO para que sea local o en alguna base de datos en Mongo Atlas
const dbConnect = process.env.DB_CLOUD;
// const dbConnect = `mongodb://${IP_SERVER}:${PORT_DB}/cursoCRM`;

const dbPORT = "MongoAtlas";
// const dbPORT = PORT_DB;

const conectarDB = async () => {
   try {
      mongoose.set("useFindAndModify", false);
      mongoose.set("useCreateIndex", true);
      await mongoose.connect(
         dbConnect,

         { useNewUrlParser: true, useUnifiedTopology: true },

         (err, res) => {
            if (err) {
               throw err;
            } else {
               console.log("-------------------------------------------");
               console.log("La conexion a la base de datos es correcta.");
               console.log(`---------- DB Port: ${dbPORT} ------------`);
               console.log("*******************************************");
            }
         }
      );
   } catch (error) {
      console.log(" --- Error al conectar la Base de Datos ---");
      console.log(error);
      process.exit(1); // detener la app
   }
};

module.exports = conectarDB;
