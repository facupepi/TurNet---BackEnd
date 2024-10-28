// Importamos el objeto 'models' de Sequelize, que contiene todas las entidades del modelo de datos.
const { models } = require('../../sequelize');

// Importamos la función de ayuda para validar y obtener el ID de los parámetros de la solicitud.
const { getIdParam } = require('../helpers');

// Función para obtener todos los registros de la entidad.
// Realiza una consulta a la base de datos y devuelve los resultados en formato JSON.
async function getAll(req, res) {
	const entities = await models.reserva.findAll();  // Cambia 'reserva' por la entidad deseada.
	res.status(200).json(entities);  // Devuelve un estado 200 (éxito) junto con los datos.
};

// Función para obtener un registro específico por su ID.
// Valida el ID, busca el registro en la base de datos y lo devuelve en formato JSON.
async function getById(req, res) {
	const id = getIdParam(req);  // Valida y convierte el ID a número.
	const entity = await models.reserva.findByPk(id);  // Cambia 'reserva' por la entidad deseada.
	if (entity) {
		res.status(200).json(entity);  // Si el registro existe, lo devuelve con un estado 200.
	} else {
		res.status(404).send('404 - Not found');  // Si no se encuentra, devuelve un error 404.
	}
};

async function getReservasByServiceByDay(req, res) {
    // Extraemos la fecha y el id_servicio de los parámetros de consulta
    const { id_servicio, fecha } = req.params; // Usamos req.params para obtener los parámetros de la ruta

    try {
        // Validamos que ambos parámetros hayan sido proporcionados
        if (!fecha || !id_servicio) {
            return res.status(400).json({ message: 'Debe proporcionar la fecha y el id del servicio.' });
        }

        // Buscamos las reservas en la base de datos que coincidan con la fecha y el id_servicio
        const reservas = await models.reserva.findAll({
            where: {
                id_servicio: id_servicio, // Filtramos por id_servicio
                fecha: fecha // Filtramos por la fecha directamente
            },
            include: [
                {
                    model: models.cliente, // Incluimos información sobre el cliente relacionado con la reserva
                    attributes: ['nombre', 'email'] // Solo seleccionamos el nombre y el email del cliente
                },
                {
                    model: models.servicio, // Incluimos información sobre el servicio relacionado con la reserva
                    attributes: ['nombre', 'precio'] // Solo seleccionamos el nombre y el precio del servicio
                }
            ]
        });

        // Verificamos si se encontraron reservas
        if (reservas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron reservas para la fecha y servicio especificados.' });
        }

        // Respondemos con las reservas encontradas
        return res.status(200).json(reservas);

    } catch (error) {
        // Manejamos cualquier error que pueda ocurrir durante la ejecución
        console.error('Error al obtener reservas:', error);
        return res.status(500).json({ message: 'Error al obtener reservas.' });
    }
}





// Función para crear un nuevo registro en la base de datos.
// Valida que el cuerpo de la solicitud no incluya un ID, ya que este se genera automáticamente.
async function create(req, res) {
    const { id_cliente, id_servicio, fecha, hora } = req.body;

    try {
        // Verificación de los campos necesarios
        if (!id_cliente || !id_servicio || !fecha || !hora) {
            return res.status(400).json({ message: 'Faltan parámetros obligatorios: id_cliente, id_servicio, fecha, hora.' });
        }

        // Verificamos que el cliente exista
        const cliente = await models.cliente.findByPk(id_cliente);
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado.' });
        }

        // Verificamos que el servicio exista
        const servicio = await models.servicio.findByPk(id_servicio);
        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        // Asegurarse de convertir la fecha correctamente al trabajar en UTC
        const fechaObj = new Date(`${fecha}T00:00:00Z`); // Convertimos la fecha al formato UTC
        const diaSemana = fechaObj.getUTCDay(); // Usamos getUTCDay para obtener el día de la semana en UTC
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const nombreDia = diasSemana[diaSemana];

        console.log(`Fecha: ${fecha}, Día de la semana (UTC): ${nombreDia}`);

        // Verificar que el servicio maneje ese día laboral
        const diaLaboral = await models.dias_laborales.findOne({
            where: {
                id_servicio,
            }
        });

        if (!diaLaboral) {
            return res.status(400).json({ message: `El servicio no está disponible el día ${nombreDia}.` });
        }

        // Verificar que el servicio maneje ese horario laboral
        const horarioLaboral = await models.horarios_laborales.findOne({
            where: {
                id_servicio,
                '$horario.hora$': hora
            },
            include: [{
                model: models.horario,
                as: 'horario'
            }]
        });

        if (!horarioLaboral) {
            return res.status(400).json({ message: `El servicio no está disponible a las ${hora}.` });
        }

        // Verificamos que no haya una reserva existente para la misma fecha y hora
        const reservaExistente = await models.reserva.findOne({
            where: {
                id_servicio,
                fecha,
                hora
            }
        });

        if (reservaExistente) {
            return res.status(409).json({ message: 'Ya existe una reserva para este servicio, fecha y hora.' });
        }

        // Creamos la reserva si no hay conflictos
        const nuevaReserva = await models.reserva.create({
            id_cliente,
            id_servicio,
            fecha,
            hora
        });

        // Devolvemos una respuesta exitosa
        return res.status(201).json({ message: 'Reserva creada exitosamente', reserva: nuevaReserva });
    } catch (error) {
        // Manejo de errores
        console.error('Error al crear reserva:', error);
        return res.status(500).json({ message: 'Error al crear la reserva' });
    }
}

// Función para actualizar un registro existente.
// Acepta la actualización solo si el ID del parámetro de la URL coincide con el ID del cuerpo de la solicitud.
async function update(req, res) {
	const id = getIdParam(req);  // Valida y obtiene el ID del parámetro de la URL.

	// Solo se permite la actualización si el ID del cuerpo coincide con el ID de la URL.
	if (req.body.id === id) {
		await models.reserva.update(req.body, {  // Cambia 'reserva' por la entidad deseada.
			where: {
				id: id  // Filtra la actualización por el ID proporcionado.
			}
		});
		res.status(200).end();  // Devuelve un estado 200 (éxito) y finaliza la respuesta.
	} else {
		res.status(400).send(`Bad request: param ID (${id}) does not match body ID (${req.body.id}).`);
	}
};

// Función para eliminar un registro de la base de datos por su ID.
// Busca el registro por el ID en la URL y lo elimina si existe.
async function remove(req, res) {
	const id = getIdParam(req);  // Valida y obtiene el ID del parámetro de la URL.
	await models.reserva.destroy({  // Cambia 'reserva' por la entidad deseada.
		where: {
			id: id  // Filtra la eliminación por el ID proporcionado.
		}
	});
	res.status(200).end();  // Devuelve un estado 200 (éxito) y finaliza la respuesta.
};

// Exportamos las funciones para que puedan ser usadas en otros módulos (rutas).
module.exports = {
	getAll,    // Función para obtener todos los registros.
	getById,   // Función para obtener un registro por ID.
	create,    // Función para crear un nuevo registro.
	update,    // Función para actualizar un registro existente.
	remove,    // Función para eliminar un registro.
	getReservasByServiceByDay,
};
