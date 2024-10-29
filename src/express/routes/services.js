const { models } = require('../../sequelize');
const { getIdParam } = require('../helpers');

async function getServiceBookingsByDay(req, res) {
    const { id_service } = req.params;
    const { date } = req.query;

    try {
        if (!date || !id_service) {
            return res.status(400).json({ message: 'Debe proporcionar la fecha y el id del servicio.' });
        }

        const bookings = await models.booking.findAll({
            where: {
                service_id: id_service,
                date: date
            },
            include: [
                {
                    model: models.client,
                    attributes: ['name', 'email']
                },
                {
                    model: models.service,
                    attributes: ['name', 'price']
                }
            ]
        });

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'No se encontraron reservas para la fecha y service especificados.' });
        }

        return res.status(200).json(bookings);
    } catch (error) {
        console.error('Error al obtener bookings:', error);
        return res.status(500).json({ message: 'Error al obtener reservas.' });
    }
}

async function getAll(req, res) {
    const entities = await models.service.findAll();
    res.status(200).json(entities);
}

async function getById(req, res) {
    const id = getIdParam(req);
    const entity = await models.service.findByPk(id);
    if (entity) {
        res.status(200).json(entity);
    } else {
        res.status(404).send('404 - Not found');
    }
}

async function create(req, res) {
    if (req.body.id) {
        return res.status(400).send(`Solicitud incorrecta: el ID no debe ser proporcionado, ya que es determinado automáticamente por la base de datos.`);
    }
    try {
        const newService = await models.service.create(req.body);
        return res.status(201).json(newService);
    } catch (error) {
        console.error('Error al crear el service:', error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: 'Error de validación: ' + error.errors.map(e => e.message).join(', ') });
        }
        return res.status(500).json({ message: 'Error al crear el servicio' });
    }
}

async function update(req, res) {
    const id = getIdParam(req);
    if (req.body.id === id) {
        await models.service.update(req.body, {
            where: { id: id }
        });
        res.status(200).end();
    } else {
        res.status(400).send(`Bad request: param ID (${id}) does not match body ID (${req.body.id}).`);
    }
}

async function remove(req, res) {
    const id = getIdParam(req);
    await models.service.destroy({
        where: { id: id }
    });
    res.status(200).end();
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    getServiceBookingsByDay
};
