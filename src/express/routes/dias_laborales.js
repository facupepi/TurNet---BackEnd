// Importamos el objeto 'models' de Sequelize, que contiene todas las entidades del modelo de datos.
const { models } = require('../../sequelize');

// Importamos la función de ayuda para validar y obtener el ID de los parámetros de la solicitud.
const { getIdParam } = require('../helpers');

// Función para obtener todos los registros de días laborales filtrando por ID de servicio.
async function getDiasByServicio(req, res) {
    const { id_servicio } = req.params;  // Obtiene el ID del servicio de los parámetros de la solicitud.
    try {
        const diasLaborales = await models.dias_laborales.findAll({
            where: {
                id_servicio: id_servicio,  // Filtra los registros por ID de servicio.
            },
            include: [{
                model: models.dia,   // Incluye la entidad 'dia'.
                attributes: ['nombre']     // Especifica que solo quieres obtener el campo 'nombre'.
            }]
        });

        res.status(200).json(diasLaborales);  // Devuelve los días laborales encontrados con los campos 'nombre'.
    } catch (error) {
        console.error('Error al obtener días laborales:', error);
        res.status(500).json({ message: 'Error al obtener días laborales' });
    }
};

// Función para obtener todos los registros de la entidad días laborales.
async function getAll(req, res) {
    const entities = await models.dias_laborales.findAll();
    res.status(200).json(entities);
};

// Función para obtener un registro específico de días laborales por su ID.
async function getById(req, res) {
    const id = getIdParam(req);
    const entity = await models.dias_laborales.findByPk(id);
    if (entity) {
        res.status(200).json(entity);
    } else {
        res.status(404).send('404 - Not found');
    }
};
async function create(req, res) {
    // Extraemos los días y el id_servicio del cuerpo de la solicitud
    const { dias, id_servicio } = req.body;

    try {
        // Definimos los días válidos de la semana
        const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

        // Validamos que el array de días no esté vacío
        if (!dias || dias.length === 0) {
            return res.status(400).json({ message: 'Debe proporcionar al menos un día laboral.' });
        }

        // Validamos que todos los días proporcionados en el array sean válidos
        const diasInvalidos = dias.filter(dia => !diasSemana.includes(dia));
        if (diasInvalidos.length > 0) {
            return res.status(400).json({ message: `Los siguientes días son inválidos: ${diasInvalidos.join(', ')}` });
        }

        // Verificamos que el servicio exista en la base de datos
        const servicio = await models.servicio.findByPk(id_servicio);

        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        // Obtenemos los IDs y nombres de los días seleccionados desde la base de datos
        const diasValidos = await models.dia.findAll({
            where: {
                nombre: dias // Filtramos por los nombres de los días seleccionados
            }
        });

        // Verificamos si se encontraron los días válidos en la base de datos
        if (diasValidos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron días válidos.' });
        }

        // Creamos los registros de días laborales usando los IDs y nombres de los días obtenidos
        const registros = diasValidos.map(dia => ({
            id_servicio: id_servicio, // Asignamos el id_servicio
            id_dia: dia.id, // Usamos el ID del día de la base de datos
            nombre_dia: dia.nombre // Incluimos el nombre del día
        }));

        // Usamos bulkCreate para insertar múltiples registros de días laborales en la base de datos
        const diasLaboralesCreados = await models.dias_laborales.bulkCreate(registros, { returning: true });

        // Formateamos la respuesta incluyendo el nombre de los días laborales creados
        const respuesta = diasLaboralesCreados.map(diaLaboral => ({
            id_servicio: diaLaboral.id_servicio,
            id_dia: diaLaboral.id_dia,
            nombre_dia: diasValidos.find(dia => dia.id === diaLaboral.id_dia).nombre
        }));

        // Respondemos con los días laborales recién creados
        return res.status(201).json({
            message: 'Días laborales creados exitosamente',
            diasLaborales: respuesta
        });

    } catch (error) {
        // Manejamos cualquier error que pueda ocurrir durante el proceso
        console.error('Error al crear días laborales:', error);
        return res.status(500).json({ message: 'Error al crear días laborales' });
    }
}



// Función para actualizar un registro existente de días laborales.
async function update(req, res) {
    const id = getIdParam(req);
    if (req.body.id === id) {
        await models.dias_laborales.update(req.body, {
            where: {
                id: id
            }
        });
        res.status(200).end();
    } else {
        res.status(400).send(`Bad request: param ID (${id}) does not match body ID (${req.body.id}).`);
    }
};

// Función para eliminar un registro de días laborales por su ID.
async function remove(req, res) {
    const id = getIdParam(req);
    await models.dias_laborales.destroy({
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
    getDiasByServicio, // Nueva función para obtener días laborales filtrados por servicio
};
