/**
 * @description Migration to seed the levels collection with initial data.
 */
module.exports = {
    async up(db) {
      const levels = [
        {
          name: "Descafeinado",
          description: "¿Puede haber algo más vergonzoso?",
          requirements: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Ristretto",
          description: "¿Hay algo menos que un espresso? Sí, ½ espresso.",
          requirements: 200,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Espresso",
          description: "Llegaste a la base de cualquier café, donde la magia comienza.",
          requirements: 500,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Doppio",
          description: "¿Necesitas un poco más de adrenalina? Acá tienes dos espressos.",
          requirements: 750,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Macchiato",
          description: "¿Qué pasará si le agregamos ahora un poco de leche?",
          requirements: 1000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Americano",
          description: "Para los amantes del 'café café', un clásico de todos los tiempos.",
          requirements: 1500,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Capuccino",
          description: "El equilibrio perfecto entre el café y la leche.",
          requirements: 2000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Latte",
          description: "Estamos ahora ante una verdadera polémica, odiado por muchos, amado por otros.",
          requirements: 3000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Mocaccino",
          description: "¿Qué pensarías si te digo que le puedo añadir choco a tu café?",
          requirements: 4000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Flat White",
          description: "El 'minimalista del café': menos espuma, más sabor.",
          requirements: 5000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
  
      await db.collection('levels').insertMany(levels);
    },
  
    async down(db) {
      await db.collection('levels').deleteMany({});
    },
  };
  