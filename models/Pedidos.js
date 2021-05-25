// Lesson 47:
const mongoose = require("mongoose");

const ProductoSchema = mongoose.Schema({
   pedido: {
      type: Array,
      required: true,
   },
   total: {
      type: Number,
      required: true,
   },
   cliente: {
      // de qué cliente es el pedido, hacemos una referencia a Model de "Cliente"
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cliente",
      required: true,
   },
   vendedor: {
      // de qué vendedor es el pedido, hacemos una referencia a Model de "Usuario"
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
   },
   estado: {
      type: String,
      default: "PENDIENTE",
   },
   creado: {
      type: Date,
      default: Date.now(),
   },
});

module.exports = mongoose.model("Pedido", ProductoSchema);
