const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const yaml = require('js-yaml');
const multer = require('multer');

const app = express();
const port = 3000;

app.use(express.json()); // Middleware to parse JSON body

const storage = multer.memoryStorage(); // You can also set this to diskStorage for saving files to disk
const upload = multer({ storage: storage });

const messages = [
  'First message',
  'Second message'
]

const apiKey = 'Bearer dcebc6ced1IOEUZHIUQHE5fb919d37b5d1f9eb2dec2';

const authenticateApiKey = (req, res, next) => {
  const userApiKey = req.get('Authorization');
  if (userApiKey === apiKey) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: Invalid API key' });
  }
};

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
app.get('/messages',authenticateApiKey, (req, res) => {
  res.json({ messages: messages });
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
app.post('/messages', authenticateApiKey, (req, res) => {
  const newMessage = req.body.message;
  if (!newMessage) {
    return res.status(400).json({ success: false, message: "No message provided" });
  }
  messages.push(newMessage)
  // Here you would typically add the message to a database or in-memory storage
  res.json({ success: true, message: newMessage });
});

/**
 * @swagger
 * /creatures:
 *   post:
 *     summary: Creates a new creature
 *     description: Add a new creature with name, description, elements, and an image.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the creature.
 *               description:
 *                 type: string
 *                 description: The description of the creature.
 *               elements:
 *                 type: string
 *                 description: Comma-separated elements associated with the creature.
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image of the creature.
 *     responses:
 *       201:
 *         description: New creature created successfully.
 */
app.post('/creatures', upload.single('image'), (req, res) => {
  // Extracting text fields and file
  const { name, description, elements } = req.body;
  const image = req.file; // Extracted image

  // Create a new creature object with a unique ID
  const newCreature = {
    id: creatures.length + 1,
    name,
    description,
    elements: elements ? elements.split(',') : [], // Assuming elements are sent as a comma-separated string
    image: image ? { data: image.buffer, contentType: image.mimetype } : null
  };

  creatures.push(newCreature);

  res.status(201).json(newCreature);
});

/**
 * @swagger
 * /creatures:
 *   get:
 *     summary: Retrieves all creatures
 *     description: Get a list of all creatures with their details.
 *     responses:
 *       200:
 *         description: A list of creatures.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The creature ID.
 *                   name:
 *                     type: string
 *                     description: The name of the creature.
 *                   description:
 *                     type: string
 *                     description: The description of the creature.
 *                   elements:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: List of elements associated with the creature.
 *                   image:
 *                     type: string
 *                     format: binary
 *                     description: The image of the creature.
 */
app.get('/creatures', (req, res) => {
  res.json(creatures);
});

/**
 * @swagger
 * /creatures/{id}:
 *   patch:
 *     summary: Updates a creature's name
 *     description: Update the name of a creature by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the creature to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the creature.
 *     responses:
 *       200:
 *         description: Creature name updated successfully.
 *       404:
 *         description: Creature not found.
 */
app.patch('/creatures/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  let creatureFound = false;
  creatures = creatures.map(creature => {
    if (creature.id == id) {
      creatureFound = true;
      return { ...creature, name };
    }
    return creature;
  });

  if (!creatureFound) {
    return res.status(404).send('Creature not found');
  }

  res.status(200).send('Creature name updated successfully');
});

app.get('/privacy', (req, res) => {
  res.sendFile(__dirname + '/privacy.html')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
