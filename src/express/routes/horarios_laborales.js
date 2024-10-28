// Importamos el objeto 'models' de Sequelize, que contiene todas las entidades
// del modelo de datos.
const {models} = require('../../sequelize');

// Importamos la función de ayuda para validar y obtener el ID de los parámetros
// de la solicitud.
const {getIdParam} = require('../helpers');

// Función para obtener todos los registros de días laborales filtrando por ID
// de servicio.
async function getHorariosByServicio(req, res) {
    const {id_servicio} = req.params; // Obtiene el ID del servicio de los parámetros de la solicitud.
    try {
        const horariosLaborales = await models
            .horarios_laborales
            .findAll({
                where: {
                    id_servicio: id_servicio, // Filtra los registros por ID de servicio.
                },
                include: [
                    {
                        model: models.horario, // Incluye la entidad 'horario'.
                        attributes: ['hora'] // Especifica que solo quieres obtener el campo 'hora'.
                    }
                ]
            });

        res
            .status(200)
            .json(horariosLaborales); // Devuelve los horarios encontrados con los campos 'hora'.
    } catch (error) {
        console.error('Error al obtener horarios:', error);
        res
            .status(500)
            .json({message: 'Error al obtener horarios'});
    }
};
// Función para obtener todos los registros de la entidad horarios laborales, incluyendo la hora.
async function getAll(req, res) {
    try {
        const entities = await models.horarios_laborales.findAll({
            attributes: ['id_servicio'],
            include: [
                {
                    model: models.horario, // Incluye el modelo de horario para obtener la hora
                    attributes: ['hora']
                },
                {
                    model: models.servicio, // Incluye el modelo de servicio para detalles adicionales
                    attributes: ['nombre']
                }
            ]
        });

        // Verificamos si se encontraron horarios laborales
        if (entities.length === 0) {
            return res.status(404).json({ message: 'No se encontraron horarios laborales.' });
        }

        // Enviamos la respuesta con los horarios laborales encontrados
        res.status(200).json(entities);

    } catch (error) {
        // Manejamos cualquier error que ocurra y lo mostramos en consola para depuración
        console.error('Error al obtener horarios laborales:', error);
        res.status(500).json({ message: 'Error al obtener horarios laborales', error: error.message });
    }
}


// Función para obtener un registro específico de horarios por su ID.
async function getById(req, res) {
    const id = getIdParam(req);
    const entity = await models
        .horarios_laborales
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
    const {horaInicio, horaFin, id_servicio} = req.body;

    try {
        // Verificamos que el servicio exista y obtenemos su duración
        const servicio = await models
            .servicio
            .findByPk(id_servicio);

        if (!servicio) {
            return res
                .status(404)
                .json({message: 'Servicio no encontrado.'});
        }

        const duracion = servicio.duracion; // Extraemos la duración del servicio (en minutos)

        // Convertimos la hora de inicio y fin a objetos Date para poder manipularlos
        const horaInicioDate = new Date(`1970-01-01T${horaInicio}:00`);
        let horaFinDate = new Date(`1970-01-01T${horaFin}:00`);

        // Si la hora de fin es menor a la hora de inicio, asumimos que cruza la
        // medianoche y ajustamos la fecha
        if (horaFinDate <= horaInicioDate) {
            horaFinDate.setDate(horaFinDate.getDate() + 1); // Avanzamos al día siguiente
        }

        // Inicializamos un array para almacenar los horarios generados
        let horariosLaborales = [];

        // Generamos los horarios a partir de la hora de inicio, incrementando según la
        // duración del servicio
        let currentHora = horaInicioDate;

        // Bucle que va generando los horarios hasta alcanzar o pasar la hora de fin
        while (currentHora <= horaFinDate) {
            // Convertimos la hora actual a formato "HH:MM:SS"
            const horaFormateada = currentHora
                .toTimeString()
                .slice(0, 8); // Aseguramos formato HH:MM:SS

            // Buscamos en la base de datos el horario que coincide con la hora generada
            const horario = await models
                .horario
                .findOne({
                    where: {
                        hora: horaFormateada
                    }
                });

            // Si el horario existe en la base de datos, lo agregamos a la lista de horarios
            // laborales
            if (horario) {
                horariosLaborales.push({
                    id_servicio: id_servicio, id_horario: horario.id, // Usamos el ID del horario recuperado
                    hora: horaFormateada // También almacenamos la hora formateada
                });
            }

            // Incrementamos la hora actual según la duración del servicio (en minutos)
            currentHora.setMinutes(currentHora.getMinutes() + duracion);
        }

        // Verificamos si se generaron horarios laborales
        if (horariosLaborales.length === 0) {
            return res
                .status(404)
                .json({message: 'No se encontraron horarios dentro del rango especificado.'});
        }

        // Usamos bulkCreate para insertar todos los registros en la tabla
        // 'horarios_laborales'
        await models
            .horarios_laborales
            .bulkCreate(horariosLaborales.map(h => ({id_servicio: h.id_servicio, id_horario: h.id_horario})));

        // Respondemos con éxito, incluyendo los horarios generados en el mensaje
        return res
            .status(201)
            .json({
                message: 'Horarios laborales creados exitosamente',
                horarios: horariosLaborales.map(h => ({id_horario: h.id_horario, hora: h.hora})) // Incluimos tanto el ID como la hora
            });

    } catch (error) {
        // Manejamos cualquier error que ocurra durante la ejecución
        console.error('Error al crear horarios laborales:', error);
        return res
            .status(500)
            .json({message: 'Error al crear horarios laborales'});
    }
}

// Función para actualizar un registro existente de horarios.
async function update(req, res) {
    const id = getIdParam(req);
    if (req.body.id === id) {
        await models
            .horario
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
        .horarios_laborales
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
    getHorariosByServicio, // Nueva función para obtener horarios filtrados por servicio
};
