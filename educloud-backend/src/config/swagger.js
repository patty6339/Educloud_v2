const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'EduCloud API',
            version: '1.0.0',
            description: 'API documentation for EduCloud learning platform',
            contact: {
                name: 'EduCloud Support',
                email: 'support@educloud.com'
            }
        },
        servers: [
            {
                url: process.env.BASE_URL || 'http://localhost:5000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: [
        path.join(__dirname, '../routes/*.js'),
        path.join(__dirname, '../docs/*.yaml')
    ]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = (app) => {
    // Serve Swagger documentation at /api-docs
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: "EduCloud API Documentation"
    }));

    // Serve raw Swagger JSON at /api-docs.json
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerDocs);
    });
};
