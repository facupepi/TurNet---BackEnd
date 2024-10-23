// Importamos las dependencias necesarias para la aplicación.
const express = require('express');  // Carga el framework Express, que facilita la creación de servidores web.
const bodyParser = require('body-parser');  // Permite analizar el cuerpo de las solicitudes entrantes (JSON, datos de formularios).

// Definimos las rutas que gestionarán diferentes partes de la aplicación.
// Cada propiedad de 'routes' corresponde a un conjunto de rutas que se gestionan en archivos separados.
const routes = {
    clientes: require('./routes/clientes'),  // Ruta para gestionar 'clientes'.
    admins: require('./routes/admins'),  // Ruta para gestionar 'admins'.
    servicios: require('./routes/servicios'),  // Ruta para gestionar 'servicios'.
    reservas: require('./routes/reservas'),  // Ruta para gestionar 'servicios'
    horarios: require('./routes/horarios'),  // Ruta para gestionar 'horarios'
    dias: require('./routes/dias'),  // Ruta para gestionar 'dias'
    horarios_laborales: require('./routes/horarios_laborales'),  // Ruta para gestionar 'horarios_laborales'
};

// Inicializamos una instancia de la aplicación Express.
const app = express();

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

//app.post('/horarios_laborales', makeHandlerAwareOfAsyncErrors(routes.horarios_laborales.create));

// Esta ruta obtiene los items asociados a una orden específica (id de la orden).
/*
app.get(`/orders/:id/items`,
    makeHandlerAwareOfAsyncErrors(routes.orders.listItems)  // Maneja errores async en 'listItems'.
);

// Esta ruta permite agregar items a una orden específica.
app.post(`/orders/:id/items`,
    makeHandlerAwareOfAsyncErrors(routes.orders.addItem)  // Maneja errores async en 'addItem'.
);
*/

// Exportamos la aplicación para poder ser utilizada en otro lugar (como en 'index.js' o para pruebas).
module.exports = app;
