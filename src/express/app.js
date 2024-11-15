// Importamos las dependencias necesarias para la aplicación.
const express = require('express');  // Carga el framework Express, que facilita la creación de servidores web.
const bodyParser = require('body-parser');  // Permite analizar el cuerpo de las solicitudes entrantes (JSON, datos de formularios).

const cookieParser = require('cookie-parser');

const jwt = require('jsonwebtoken');
const { models } = require('./../sequelize');

const cors = require('cors');

const validateToken = require('./helpers').validateToken;

import dotenv from 'dotenv';
dotenv.config();

// Definimos las rutas que gestionarán diferentes partes de la aplicación.
// Cada propiedad de 'routes' corresponde a un conjunto de rutas que se gestionan en archivos separados.
const routes = {
    clients: require('./routes/clients'),  // Ruta para gestionar 'clientes'.
    services: require('./routes/services'),  // Ruta para gestionar 'servicios'.
    bookings: require('./routes/bookings'),  // Ruta para gestionar 'servicios'
};

// Inicializamos una instancia de la aplicación Express.
const app = express();

// Configuramos la aplicación para que use 'cookie-parser' y analice las cookies de las solicitudes.
app.use(cookieParser());

// Configuramos la aplicación para que use CORS y permita solicitudes desde el cliente.
app.use(cors({
    origin: process.env.FRONTEND_URL, // Cambia esto a la URL de tu cliente
    credentials: true
}));

// Configuramos el middleware para analizar el cuerpo de las solicitudes.
// 'bodyParser.json()' analiza el cuerpo de las solicitudes en formato JSON.
// 'bodyParser.urlencoded({ extended: true })' permite analizar datos de formularios codificados en URL.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Función que envuelve los controladores para que manejen correctamente los errores asincrónicos.
 * En Express, si una función async lanza un error, no se propaga correctamente a 'next(error)' a menos
 * que lo manejemos explícitamente. Esta función asegura que los errores en handlers async sean capturados.
 */
function makeHandlerAwareOfAsyncErrors(handler) {
    return async function(req, res, next) {
        try {
            // Intentamos ejecutar el handler, que es una función async que maneja la solicitud.
            await handler(req, res);
        } catch (error) {
            // Si ocurre un error, se lo pasamos al manejador de errores de Express con 'next'.
            next(error);
        }
    };
}

// Definimos las rutas estándar REST (GET, POST, PUT, DELETE) para cada uno de los controladores definidos en 'routes'.
// Recorremos todas las entradas del objeto 'routes' (clientes, items, orders, etc.).
for (const [routeName, routeController] of Object.entries(routes)) {
    // Si el controlador tiene un método 'getAll', creamos una ruta GET para obtener todos los registros.
    if (routeController.getAll) {
        app.get(
            `/${routeName}`,  // Define la ruta en el formato '/clientes', '/items', etc.
              // Valida el token de acceso antes de ejecutar el controlador.
            makeHandlerAwareOfAsyncErrors(routeController.getAll)  // Asigna el controlador y maneja errores async.
        );
    }
    // Si el controlador tiene un método 'getById', creamos una ruta GET con un parámetro ':id' para obtener un registro por ID.
    if (routeController.getById) {
        app.get(
            `/${routeName}/:id`,  // Ruta en formato '/clientes/:id', etc.
            makeHandlerAwareOfAsyncErrors(routeController.getById)
        );
    }
    // Si el controlador tiene un método 'create', creamos una ruta POST para crear un nuevo registro.
    if (routeController.create) {
        app.post(
            `/${routeName}`,  // Ruta para crear un nuevo recurso, como '/clientes', etc.
            makeHandlerAwareOfAsyncErrors(routeController.create)
        );
    }
    // Si el controlador tiene un método 'update', creamos una ruta PUT para actualizar un registro existente.
    if (routeController.update) {
        app.put(
            `/${routeName}/:id`,  // Ruta en formato '/clientes/:id', etc., para actualizar por ID.
            makeHandlerAwareOfAsyncErrors(routeController.update)
        );
    }
    // Si el controlador tiene un método 'remove', creamos una ruta DELETE para eliminar un registro por ID.
    if (routeController.remove) {
        app.delete(
            `/${routeName}/:id`,  // Ruta en formato '/clientes/:id', etc., para eliminar por ID.
            makeHandlerAwareOfAsyncErrors(routeController.remove)
        );
    }
}

// Definimos rutas adicionales específicas que no siguen el patrón REST.
app.get('/services', makeHandlerAwareOfAsyncErrors(routes.services.getAll));

app.get('/services/:id_service/bookings', makeHandlerAwareOfAsyncErrors(routes.services.getServiceBookingsByDay));

app.get('/bookings/clients/:id_client', validateToken, makeHandlerAwareOfAsyncErrors(routes.bookings.getBookingsByIDClient));

app.post("/login", makeHandlerAwareOfAsyncErrors(routes.clients.login));

app.post("/auth", validateToken, makeHandlerAwareOfAsyncErrors(routes.clients.auth));

app.post('/logout', makeHandlerAwareOfAsyncErrors( (req, res) => {
    res.clearCookie('accessToken');
    res.status(200).json({ message: 'Sesion Cerrada' });
}));

app.get('/services/:id_service/available-times',validateToken, makeHandlerAwareOfAsyncErrors(routes.services.getAvailableTimesByServiceAndDate));

// Exportamos la aplicación para poder ser utilizada en otro lugar (como en 'index.js' o para pruebas).
module.exports = app;
