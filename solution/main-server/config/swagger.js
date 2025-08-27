const swaggerJsDoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TWEB API",
      description: "API del Main Server",
    },
    components: {
      schemas: {
        HealthStatus: {
          type: "object",
          properties: {
            status: { type: "string", example: "ok" },
            message: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
            uptime: { type: "number" },
            enviroment: { type: "string" },
          },
        },
        ReviewStats: {
          type: "object",
          properties: {
            totalReviews: { type: "integer" },
            totalReviewsWithScore: { type: "integer" },
            averageScore: { type: "number" },
            maxScore: { type: "number" },
            minScore: { type: "number" },
            freshCount: { type: "integer" },
            rottenCount: { type: "integer" },
            positiveScoreCount: { type: "integer" },
            negativeScoreCount: { type: "integer" },
            topCriticsCount: { type: "integer" },
            freshPercentage: { type: "number" },
            rottenPercentage: { type: "number" },
            positiveScorePercentage: { type: "number" },
            negativeScorePercentage: { type: "number" },
            topCriticsPercentage: { type: "number" },
          },
        },
        Review: {
          type: "object",
          properties: {
            id_movie: { type: "integer" },
            movie_title: { type: "string" },
            critic_name: { type: "string" },
            publisher_name: { type: "string" },
            review_type: { type: "string" },
            review_score: { type: "number" },
            review_date: { type: "string" },
            review_content: { type: "string" },
            top_critic: { type: "boolean" },
          },
        },
      },
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
