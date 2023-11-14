const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
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
    servers: [{
      url: "https://multiplayer-gpt.caillef.com/"
    }]
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
 The warnings you're encountering are related to some common requirements and best practices in OpenAPI (Swagger) documentation. Let's address these issues:

1. **"In components section, schemas subsection is not an object"**: This error suggests that in your Swagger documentation, under the `components` section, the `schemas` subsection is not properly formatted as an object. The `schemas` subsection should be an object where each schema definition is a property.

2. **"In path /messages, method get is missing operationId; skipping"** and **"In path /messages, method post is missing operationId; skipping"**: The `operationId` is a unique string used to identify an operation. If you don't provide it, some tools may not work correctly or might skip processing these paths.

Here's how you can modify your existing Swagger comments to address these issues:

- Ensure that the `schemas` subsection under `components` is properly formatted.
- Add `operationId` to each route.

Here's an example of how to adjust your comments:

```javascript
/**
 * @swagger
 * 
 * /messages:
 *   get:
 *     summary: Retrieve a list of messages
 *     operationId: getMessages
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
 * */
app.get('/messages', (req, res) => {
  res.json({ messages: ["First message", "Second message"] });
});

// POST /messages route
/**
 * @swagger
 * 
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 * 
 * /messages:
 *   post:
 *     summary: Post a new message
 *     operationId: postMessage
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
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
