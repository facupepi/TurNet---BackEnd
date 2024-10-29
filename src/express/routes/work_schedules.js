// Importamos el objeto 'models' de Sequelize, que contiene todas las entidades
// del modelo de datos.
const {models} = require('../../sequelize');

// Importamos la función de ayuda para validar y obtener el ID de los parámetros
// de la solicitud.
const {getIdParam} = require('../helpers');

// Función para obtener todos los registros de días laborales filtrando por ID
// de servicio.
async function getWorkSchedulesByService(req, res) {
    const {id_service} = req.params; // Obtiene el ID del servicio de los parámetros de la solicitud.
    try {
        const workSchedules = await models
            .work_schedules
            .findAll({
                where: {
                    service_id: id_service, // Filtra los registros por ID de servicio.
                },
                include: [
                    {
                        model: models.schedule, // Incluye la entidad 'schedule'.
                        attributes: ['time'] // Especifica que solo quieres obtener el campo 'time'.
                    }
                ]
            });

        res
            .status(200)
            .json(workSchedules); // Devuelve los horarios encontrados con los campos 'time'.
    } catch (error) {
        console.error('Error al obtener horarios:', error);
        res
            .status(500)
            .json({message: 'Error al obtener horarios'});
    }
};

// Función para obtener todos los registros de la entidad work schedules, incluyendo la time.
async function getAll(req, res) {
    try {
        const entities = await models.work_schedules.findAll({
            attributes: ['service_id'],
            include: [
                {
                    model: models.schedule, // Incluye el modelo de schedule para obtener la time
                    attributes: ['time']
                },
                {
                    model: models.service, // Incluye el modelo de service para detalles adicionales
                    attributes: ['name']
                }
            ]
        });

        // Verificamos si se encontraron work schedules
        if (entities.length === 0) {
            return res.status(404).json({ message: 'No se encontraron work schedules.' });
        }

        // Enviamos la respuesta con los work schedules encontrados
        res.status(200).json(entities);

    } catch (error) {
        // Manejamos cualquier error que ocurra y lo mostramos en consola para depuración
        console.error('Error al obtener horarios:', error);
        res.status(500).json({ message: 'Error al obtener horarios', error: error.message });
    }
}

// Función para obtener un registro específico de horarios por su ID.
async function getById(req, res) {
    const id = getIdParam(req);
    const entity = await models
        .work_schedules
        .findByPk(id);
    if (entity) {
        res
            .status(200)
            .json(entity);
    } else {
        res
            .status(404)
            .send('404 - Not found');
    }
};

async function create(req, res) {
    const { startTime,  endTime, id_service } = req.body;

    try {
        // Verificamos que el servicio exista y obtenemos su duración
        const service_temp = await models.service.findByPk(id_service);

        if (!service_temp) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        const duration = service_temp.duration; // Extraemos la duración del servicio (en minutos)

        // Convertimos la hora de inicio y fin a objetos Date para poder manipularlos
        const startTimeDate = new Date(`1970-01-01T${startTime}:00`);
        let endTimeDate = new Date(`1970-01-01T${endTime}:00`);

        // Si la hora de fin es menor a la hora de inicio, asumimos que cruza la medianoche y ajustamos la fecha
        if (endTimeDate <= startTimeDate) {
            endTimeDate.setDate(endTimeDate.getDate() + 1); // Avanzamos al día siguiente
        }

        // Inicializamos un array para almacenar los horarios generados
        let workSchedules = [];

        // Generamos los horarios a partir de la hora de inicio, incrementando según la duración del servicio
        let currentHour = startTimeDate;

        // Bucle que va generando los horarios hasta alcanzar o pasar la hora de fin
        while (currentHour <= endTimeDate) {
            // Convertimos la hora actual a formato "HH:MM:SS"
            const formattedTime = currentHour.toTimeString().slice(0, 8); // Aseguramos formato HH:MM:SS

            // Buscamos en la base de datos el horario que coincide con la hora generada
            const schedule = await models.schedule.findOne({
                where: { time: formattedTime }
            });

            // Si el schedule existe en la base de datos, lo agregamos a la lista de work schedules
            if (schedule) {
                workSchedules.push({
                    id_service: id_service, 
                    id_schedule: schedule.id, // Usamos el ID del schedule recuperado
                    time: formattedTime // También almacenamos la time formateada
                });
            }

            // Incrementamos la hora actual según la duración del servicio (en minutos)
            currentHour.setMinutes(currentHour.getMinutes() + duration);
        }

        // Verificamos si se generaron work schedules
        if (workSchedules.length === 0) {
            return res.status(404).json({ message: 'No se encontraron horarios dentro del rango especificado.' });
        }

        // Usamos bulkCreate para insertar todos los registros en la tabla 'work_schedules'
        console.log('\n\n\nworkSchedules:', workSchedules);

        await models.work_schedules.bulkCreate(
            workSchedules.map(schedule_temp => ({
                service_id: schedule_temp.id_service,
                schedule_id: schedule_temp.id_schedule
            }))
        );

        // Respondemos con éxito, incluyendo los horarios generados en el mensaje
        return res.status(201).json({
            message: 'Work schedules created successfully',
            workSchedules: workSchedules.map(schedule_temp => ({
                id_schedule: schedule_temp.id_schedule, 
                time: schedule_temp.time
            })) // Incluimos tanto el ID como la time
        });

    } catch (error) {
        // Manejamos cualquier error que ocurra durante la ejecución
        console.error('Error al crear work schedules:', error);
        return res.status(500).json({ message: 'Error al crear horarios' });
    }
}

// Función para actualizar un registro existente de horarios.
async function update(req, res) {
    const id = getIdParam(req);
    if (req.body.id === id) {
        await models
            .schedule
            .update(req.body, {
                where: {
                    id: id
                }
            });
        res
            .status(200)
            .end();
    } else {
        res
            .status(400)
            .send(`Bad request: param ID (${id}) does not match body ID (${req.body.id}).`);
    }
};

// Función para eliminar un registro de horarios por su ID.
async function remove(req, res) {
    const id = getIdParam(req);
    await models
        .work_schedules
        .destroy({
            where: {
                id: id
            }
        });
    res
        .status(200)
        .end();
};

// Exportamos las funciones para que puedan ser usadas en otros módulos (rutas).
module.exports = {
    getAll, // Función para obtener todos los registros.
    getById, // Función para obtener un registro por ID.
    create, // Función para crear un nuevo registro.
    update, // Función para actualizar un registro existente.
    remove, // Función para eliminar un registro.
    getWorkSchedulesByService, // Nueva función para obtener horarios filtrados por servicio
};
