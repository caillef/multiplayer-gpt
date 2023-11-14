const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const app = express();
const port = 3000;

// Swagger set up
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Messages API',
      version: '1.0.0',
      description: 'A simple API to get messages',
    },
  },
  apis: ['./index.js'], // files containing annotations for the OpenAPI Specification
};

const openapiSpecification = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

// GET /messages route
/**
 * @swagger
 * /messages:
 *   get:
 *     summary: Retrieve a list of messages
 *     responses:
 *       200:
 *         description: A list of messages.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["First message", "Second message"]
 */
app.get('/messages', (req, res) => {
  res.json({ messages: ["First message", "Second message"] });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
