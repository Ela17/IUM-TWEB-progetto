const swaggerJsDoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TWEB API",
      description: "API del Main Server",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Server locale",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

module.exports = swaggerJsDoc(swaggerOptions);
