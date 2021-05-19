//Los RESOLVERS van relacionados con el Schema y con los Models

// --- RESOLVERS ---
const resolvers = {
   Query: {
      obtenerCursos: (_, { input }, ctx) => {
         return "Something";
      },
   },
};

module.exports = resolvers;
