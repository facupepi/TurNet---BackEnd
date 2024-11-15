// Importamos las dependencias necesarias para la aplicación.
const express = require('express');  // Carga el framework Express, que facilita la creación de servidores web.
const bodyParser = require('body-parser');  // Permite analizar el cuerpo de las solicitudes entrantes (JSON, datos de formularios).

const cookieParser = require('cookie-parser');
const cors = require('cors');

const validateToken = require('./helpers').validateToken;
const validateAdmin = require('./helpers').validateAdmin;

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

// Definimos rutas adicionales específicas que no siguen el patrón REST.
app.get('/services', makeHandlerAwareOfAsyncErrors(routes.services.getAllServices));

// Rutas para obtener los turnos de un servicio para un día en específico
//app.get('/services/:id_service/bookings', makeHandlerAwareOfAsyncErrors(routes.services.getServiceBookingsByDay));

// Rutas para obtener los turnos de un cliente en específico
app.get('/bookings/clients/:id_client', validateToken, makeHandlerAwareOfAsyncErrors(routes.bookings.getBookingsByIDClient));

// Rutas para loguear y autenticar un usuario (sea admin o cliente)
app.post("/login", makeHandlerAwareOfAsyncErrors(routes.clients.login));
app.post("/auth", validateToken, makeHandlerAwareOfAsyncErrors(routes.clients.auth));

// Rutas para cerrar la sesión de un usuario
app.post('/logout', makeHandlerAwareOfAsyncErrors( (req, res) => {
    res.clearCookie('accessToken');
    res.status(200).json({ message: 'Sesion Cerrada' });
}));

// Rutas para obtener los turnos disponibles de un servicio
app.get('/services/:id_service/available-times',validateToken, makeHandlerAwareOfAsyncErrors(routes.services.getAvailableTimesByServiceAndDate));

// Rutas para crear un turno
app.post('/bookings', validateToken, makeHandlerAwareOfAsyncErrors(routes.bookings.createBooking));

// Rutas para registrarse
app.post('/clients', makeHandlerAwareOfAsyncErrors(routes.clients.register));

//RUTAS PARA ADMIN

// Rutas para obtener los servicios
app.post('/services', validateToken, validateAdmin, makeHandlerAwareOfAsyncErrors(routes.services.createService));

// Rutas para obtener los turnos
app.get('/bookings', validateToken, validateAdmin, makeHandlerAwareOfAsyncErrors(routes.bookings.getAllBookings));

// Exportamos la aplicación para poder ser utilizada en otro lugar (como en 'index.js' o para pruebas).
module.exports = app;
