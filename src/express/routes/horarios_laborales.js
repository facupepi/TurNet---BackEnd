// Importamos el objeto 'models' de Sequelize, que contiene todas las entidades del modelo de datos.
const { models } = require('../../sequelize');

// Importamos la función de ayuda para validar y obtener el ID de los parámetros de la solicitud.
const { getIdParam } = require('../helpers');

// Función para obtener todos los registros de días laborales filtrando por ID de servicio.
async function getHorariosByServicio(req, res) {
	const id_servicio = req.params.id_servicio;  // Obtiene el ID del servicio de los parámetros de la solicitud.
	const id_horario = req.params.id_horario;  // Obtiene el ID del servicio de los parámetros de la solicitud.
	const horarios = await models.horarios_laborales.findAll({
		where: {
			id_servicio: id_servicio,  // Filtra los días por ID de servicio.
			id_horario: id_horario  // Filtra los días por ID de servicio.
		}
	});
	res.status(200).json(horarios);  // Devuelve los días encontrados.
};

// Función para obtener todos los registros de la entidad horarios.
async function getAll(req, res) {
	const entities = await models.horarios_laborales.findAll();
	res.status(200).json(entities);
};

// Función para obtener un registro específico de horarios por su ID.
async function getById(req, res) {
	const id = getIdParam(req);
	const entity = await models.horarios_laborales.findByPk(id);
	if (entity) {
		res.status(200).json(entity);
	} else {
		res.status(404).send('404 - Not found');
	}
};

async function create(req, res) {
    const { horaInicio, horaFin, id_servicio } = req.body;

    try {
        // Buscamos todos los horarios en la base de datos
        const horarios = await models.horario.findAll();
        console.log('Horarios encontrados:', horarios);

        // Filtramos los horarios que están dentro del rango especificado
        const horariosLaborales = horarios.filter(horario => {
            return horario.hora >= horaInicio && horario.hora <= horaFin;
        });

        console.log('Horarios laborales filtrados:', horariosLaborales);

        // Creamos los registros de horarios laborales
        const registros = horariosLaborales.map(horario => ({
            id_servicio:id_servicio,
            id_horario: horario.id
        }));

        // Usamos bulkCreate para crear múltiples registros
        await models.horarios_laborales.bulkCreate(registros);

        return res.status(201).json({ message: 'Horarios laborales creados exitosamente' });
    } catch (error) {
        console.error('Error al crear horarios laborales:', error);
        return res.status(500).json({ message: 'Error al crear horarios laborales' });
    }
}




// Función para actualizar un registro existente de horarios.
async function update(req, res) {
	const id = getIdParam(req);
	if (req.body.id === id) {
		await models.horario.update(req.body, {
			where: {
				id: id
			}
		});
		res.status(200).end();
	} else {
		res.status(400).send(`Bad request: param ID (${id}) does not match body ID (${req.body.id}).`);
	}
};

// Función para eliminar un registro de horarios por su ID.
async function remove(req, res) {
	const id = getIdParam(req);
	await models.horarios_laborales.destroy({
		where: {
			id: id
		}
	});
	res.status(200).end();
};

// Exportamos las funciones para que puedan ser usadas en otros módulos (rutas).
module.exports = {
	getAll,    // Función para obtener todos los registros.
	getById,   // Función para obtener un registro por ID.
	create,    // Función para crear un nuevo registro.
	update,    // Función para actualizar un registro existente.
	remove,    // Función para eliminar un registro.
	getHorariosByServicio, // Nueva función para obtener horarios filtrados por servicio
};
