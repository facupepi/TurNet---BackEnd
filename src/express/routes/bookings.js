// Importamos el objeto 'models' de Sequelize, que contiene todas las entidades del modelo de datos.
const { models } = require('../../sequelize');

// Importamos la función de ayuda para validar y obtener el ID de los parámetros de la solicitud.
const { getIdParam } = require('../helpers');

// Función para obtener todos los registros de la entidad.
// Realiza una consulta a la base de datos y devuelve los resultados en formato JSON.
async function getAll(req, res) {
	const entities = await models.booking.findAll();  // Cambia 'booking' por la entidad deseada.
	res.status(200).json(entities);  // Devuelve un estado 200 (éxito) junto con los datos.
};

async function getBookingsByIDClient(req, res) {
    const { id_client } = req.params;
    try {
        if (!id_client) {
            return res.status(400).json({ message: 'Debe proporcionar el ID del cliente.' });
        }

        const client = await models.client.findByPk(id_client);

        console.log('\n\n\nCliente:', client);

        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado.' });
        }

        const entities = await models.booking.findAll({
            where: { 
                client_id: id_client 
            }
        });

        console.log('\n\n\nCliente:', entities);

        entities.sort((a, b) => b.id - a.id);

        res.status(200).json({ message: 'Reservas obtenidas exitosamente.', bookings: entities });

        } catch (error) {
        console.error('Error al obtener bookings:', error);
        return res.status(500).json({ message: 'Error al obtener reservas.' });
    }
}

// Función para obtener un registro específico por su ID.
// Valida el ID, busca el registro en la base de datos y lo devuelve en formato JSON.
async function getById(req, res) {
    return res.status(400).json({ message: 'No se puede obtener una reserva por ID.' });
    /*
	const id = getIdParam(req);  // Valida y convierte el ID a número.
	const entity = await models.booking.findByPk(id);  // Cambia 'booking' por la entidad deseada.
	if (entity) {
		res.status(200).json(entity);  // Si el registro existe, lo devuelve con un estado 200.
	} else {
		res.status(404).send('404 - Not found');  // Si no se encuentra, devuelve un error 404.
	}
    */
};

async function create(req, res) {
    const { id_client, id_service, date, time } = req.body;

    try {
        // Verificación de los campos necesarios
        if (!id_client || !id_service || !date || !time) {
            return res.status(400).json({ message: 'Faltan parámetros obligatorios: id_client, id_service, date, time.' });
        }

        // Verificamos que el cliente y servicio existan
        const client = await models.client.findByPk(id_client);
        if (!client) return res.status(404).json({ message: 'Cliente no encontrado.' });

        const service = await models.service.findByPk(id_service);
        if (!service) return res.status(404).json({ message: 'Servicio no encontrado.' });

        // Obtener la fecha y hora actuales
        const now = new Date();
        
        // Convertimos la fecha y hora solicitadas a un objeto Date completo
        const requestDateTime = new Date(`${date}T${time}Z`);
        requestDateTime.setUTCHours(requestDateTime.getUTCHours() + 3);
        
        console.log('\n\n\nFecha y hora de la solicitud:', requestDateTime);

        console.log('\n\n\nFecha y hora actuales:', now);

        // Validar que la fecha y hora de la solicitud no sean en el pasado
        if (requestDateTime < now) {
            return res.status(400).json({ message: 'La fecha y hora de la reserva no pueden ser anteriores a la fecha y hora actuales.' });
        }

        // Convertir la fecha de la solicitud a un día de la semana
        const requestDate = new Date(`${date}T00:00:00Z`);
        const dayOfWeek = requestDate.getUTCDay();
        const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const dayName = daysOfWeek[dayOfWeek];

        // Verificación del día laboral
        const workingDay = await models.work_days.findOne({
            where: { 
                service_id : id_service,
                name : dayName
            }
        });

        if (!workingDay) {
            return res.status(400).json({ message: `El servicio no esta disponible el dia ${dayName}.` });
        }

        // Verificación del horario laboral
        const workingHours = await models.work_schedules.findOne({
            where: { service_id : id_service },
            include: [{
                model: models.schedule,
                as: 'schedule',
                where: { time } // Esto debería coincidir si el formato de hora es idéntico
            }]
        });

        if (!workingHours) {
            return res.status(400).json({ message: `El servicio no esta disponible a las ${time}.` });
        }

        // Verificación de reservas duplicadas
        const existingBooking = await models.booking.findOne({
            where: { 
                service_id : id_service, 
                date : date, 
                time : time 
            }
        });

        if (existingBooking) {
            return res.status(409).json({ message: 'Ya existe una reserva para el servicio, dia y hora ingresados.' });
        }

        // Crear la reserva si no hay conflictos
        const newBooking = await models.booking.create({
            client_id: id_client, service_id : id_service, date, time
        });

        return res.status(201).json({ message: 'Reserva creada exitosamente.', booking: newBooking });

    } catch (error) {
        console.error('Error al crear reserva:', error);
        return res.status(500).json({ message: 'Error al crear la reserva.' });
    }
}

// Función para actualizar un registro existente.
// Acepta la actualización solo si el ID del parámetro de la URL coincide con el ID del cuerpo de la solicitud.
async function update(req, res) {
    return res.status(400).json({ message: 'No se puede actualizar una reserva.' });
    /*
	const id = getIdParam(req);  // Valida y obtiene el ID del parámetro de la URL.

	// Solo se permite la actualización si el ID del cuerpo coincide con el ID de la URL.
	if (req.body.id === id) {
		await models.booking.update(req.body, {  // Cambia 'booking' por la entidad deseada.
			where: {
				id: id  // Filtra la actualización por el ID proporcionado.
			}
		});
		res.status(200).end();  // Devuelve un estado 200 (éxito) y finaliza la respuesta.
	} else {
		res.status(400).send(`Bad request: param ID (${id}) does not match body ID (${req.body.id}).`);
	}
    */
};

// Función para eliminar un registro de la base de datos por su ID.
// Busca el registro por el ID en la URL y lo elimina si existe.
async function remove(req, res) {
    return res.status(400).json({ message: 'No se puede eliminar una reserva.' });
    /*
	const id = getIdParam(req);  // Valida y obtiene el ID del parámetro de la URL.
	await models.booking.destroy({  // Cambia 'booking' por la entidad deseada.
		where: {
			id: id  // Filtra la eliminación por el ID proporcionado.
		}
	});
	res.status(200).end();  // Devuelve un estado 200 (éxito) y finaliza la respuesta.
    */
};

// Exportamos las funciones para que puedan ser usadas en otros módulos (rutas).
module.exports = {
	getAll,    // Función para obtener todos los registros.
	getById,   // Función para obtener un registro por ID.
	create,    // Función para crear un nuevo registro.
	update,    // Función para actualizar un registro existente.
	remove,    // Función para eliminar un registro.
    getBookingsByIDClient
};
