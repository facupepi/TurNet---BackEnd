// Importamos el objeto 'models' de Sequelize, que contiene todas las entidades del modelo de datos.
const { models } = require('../../sequelize');

// Importamos la función de ayuda para validar y obtener el ID de los parámetros de la solicitud.
const { getIdParam } = require('../helpers');

// Función para obtener todos los registros de días laborales filtrando por ID de servicio.
async function getDiasByServicio(req, res) {
    return res.status(400).json({ message: 'No se puede obtener días laborales por servicio.' });
    /*
    const { id_servicio } = req.params;  // Obtiene el ID del servicio de los parámetros de la solicitud.
    try {
        const workDays = await models.work_days.findAll({
            where: {
                service_id: id_servicio,  // Filtra los registros por ID de servicio.
            }
        });

        res.status(200).json(workDays);  // Devuelve los días laborales encontrados con los campos 'nombre'.
    } catch (error) {
        console.error('Error al obtener días laborales:', error);
        res.status(500).json({ message: 'Error al obtener días laborales' });
    }
    */
};

// Función para obtener todos los registros de la entidad días laborales.
async function getAll(req, res) {
    return res.status(400).json({ message: 'No se puede obtener días laborales.' });
    /*
    try {
        const entities = await models.work_days.findAll();
        res.status(200).json(entities);
    } catch (error) {
        console.error('Error al obtener todos los días laborales:', error);
        res.status(500).json({ message: 'Error al obtener todos los días laborales' });
    }
    */
};

// Función para obtener un registro específico de días laborales por su ID.
async function getById(req, res) {
    return res.status(400).json({ message: 'No se puede obtener un día laboral por ID.' });

    /*
    const id = getIdParam(req);
    try {
        const entity = await models.dias_laborales.findByPk(id);
        if (entity) {
            res.status(200).json(entity);
        } else {
            res.status(404).send('404 - Not found');
        }
    } catch (error) {
        console.error('Error al obtener día laboral por ID:', error);
        res.status(500).json({ message: 'Error al obtener día laboral por ID' });
    }
    */
};

// Función para crear nuevos registros de días laborales.
async function create(req, res) {
    return res.status(400).json({ message: 'No se puede crear días laborales.' });
    /*
    const { id_service, days  } = req.body;

    try {
        const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

        if (!days || days.length === 0) {
            return res.status(400).json({ message: 'Debe proporcionar al menos un día laboral.' });
        }

        const invalidDays = days.filter(day => !weekDays.includes(day));
        if (invalidDays.length > 0) {
            return res.status(400).json({ message: `Los siguientes días son inválidos: ${invalidDays.join(', ')}` });
        }

        const service_temp = await models.service.findByPk(id_service);
        if (!service_temp) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        console.log('\n\n\n service_temp:', service_temp);
        console.log('Datos del servicio:', JSON.stringify(service_temp, null, 2));

        const workDays = days.map(day => ({
            service_id: service_temp.id,
            name: day
        }));

        const newworkDays = await models.work_days.bulkCreate(workDays, { returning: true });

        return res.status(201).json({
            message: 'Días laborales creados exitosamente',
            workDays: newworkDays.map(newworkDay => ({
                service_id: newworkDay.id_servicio,
                name: newworkDay.name
            }))
        });
    } catch (error) {
        console.error('Error al crear días laborales:', error);
        return res.status(500).json({ message: 'Error al crear días laborales' });
    }
    */
};



// Función para actualizar un registro existente de días laborales.
async function update(req, res) {
    return res.status(400).json({ message: 'No se puede actualizar días laborales.' });
    /*
    const id = getIdParam(req);
    if (req.body.id === id) {
        try {
            await models.dias_laborales.update(req.body, {
                where: {
                    id: id
                }
            });
            res.status(200).end();
        } catch (error) {
            console.error('Error al actualizar día laboral:', error);
            res.status(500).json({ message: 'Error al actualizar día laboral' });
        }
    } else {
        res.status(400).send(`Bad request: param ID (${id}) does not match body ID (${req.body.id}).`);
    }
    */
};

// Función para eliminar un registro de días laborales por su ID.
async function remove(req, res) {
    return res.status(400).json({ message: 'No se puede eliminar días laborales.' });
    /*
    const id = getIdParam(req);
    try {
        await models.dias_laborales.destroy({
            where: {
                id: id
            }
        });
        res.status(200).end();
    } catch (error) {
        console.error('Error al eliminar día laboral:', error);
        res.status(500).json({ message: 'Error al eliminar día laboral' });
    }
    */
};

// Exportamos las funciones para que puedan ser usadas en otros módulos (rutas).
module.exports = {
    getAll,    // Función para obtener todos los registros.
    getById,   // Función para obtener un registro por ID.
    create,    // Función para crear un nuevo registro.
    update,    // Función para actualizar un registro existente.
    remove,    // Función para eliminar un registro.
    getDiasByServicio, // Nueva función para obtener días laborales filtrados por servicio
};
