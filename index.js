const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const yaml = require('js-yaml');
const app = express();
const port = 3000;

app.use(express.json()); // Middleware to parse JSON body

// Swagger set up
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Messages API',
      version: '1.0.0',
      description: 'A simple API to get and post messages',
    },
  },
  apis: ['./index.js'], // files containing annotations for the OpenAPI Specification
};

const openapiSpecification = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

app.get('/api-docs-raw', (req, res) => {
  res.send(yaml.dump(openapiSpecification))
});

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

// POST /messages route
/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Post a new message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "A new message"
 *     responses:
 *       200:
 *         description: Message added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 * */
app.post('/messages', (req, res) => {
  const newMessage = req.body.message;
  if (!newMessage) {
    return res.status(400).json({ success: false, message: "No message provided" });
  }
  // Here you would typically add the message to a database or in-memory storage
  res.json({ success: true, message: newMessage });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
