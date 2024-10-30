// Importamos el objeto 'models' de Sequelize, que contiene todas las entidades del modelo de datos.
const { models } = require('../../sequelize');

// Importamos la función de ayuda para validar y obtener el ID de los parámetros de la solicitud.
const { getIdParam } = require('../helpers');

// Función para obtener todos los registros de la entidad.
// Realiza una consulta a la base de datos y devuelve los resultados en formato JSON.
async function getAll(req, res) {
	const entities = await models.client.findAll();  // Cambia 'client' por la entidad deseada.
	res.status(200).json(entities);  // Devuelve un estado 200 (éxito) junto con los datos.
};

// Función para obtener un registro específico por su ID.
// Valida el ID, busca el registro en la base de datos y lo devuelve en formato JSON.
async function getById(req, res) {
	const id = getIdParam(req);  // Valida y convierte el ID a número.
	const entity = await models.client.findByPk(id);  // Cambia 'client' por la entidad deseada.
	if (entity) {
		res.status(200).json(entity);  // Si el registro existe, lo devuelve con un estado 200.
	} else {
		res.status(404).send('404 - No encontrado');  // Si no se encuentra, devuelve un error 404.
	}
};

// Función para crear un nuevo registro en la base de datos.
// Valida que el cuerpo de la solicitud no incluya un ID, ya que este se genera automáticamente.
async function create(req, res) {
	const { name, email, phone, password } = req.body;

	try {
		// Verificar que no exista un cliente con el mismo email
		const existingClient = await models.client.findOne({
			where: { email }
		});

		if (existingClient) {
			return res.status(409).json({ message: 'El email ya está registrado.' });
		}

		// Crear el nuevo cliente
		const newClient = await models.client.create({
			name,
			email,
			phone,
			password
		});

		return res.status(201).json({ message: 'Cliente creado exitosamente', cliente: newClient });
	} catch (error) {
		console.error('Error al crear cliente:', error);
		return res.status(500).json({ message: 'Error al crear cliente' });
	}
}

// Función para actualizar un registro existente.
// Acepta la actualización solo si el ID del parámetro de la URL coincide con el ID del cuerpo de la solicitud.
async function update(req, res) {
	const {name, email, phone, password} = req.body;
	const {id} = req.params;  // Valida y obtiene el ID del parámetro de la URL.

	if(!id) {
		return res.status(400).json({ message: 'Debe proporcionar un ID.' });
	}

	if(!name && !email && !phone && !password) {
		return res.status(400).json({ message: 'No hay campos para actualizar.' });
	}

	try {
		// Verificar que el cliente exista
		const client = await models.client.findByPk(id);

		if (!client) {
			return res.status(404).json({ message: 'Cliente no encontrado.' });
		}

		// Actualizar el cliente
		await models.client.update({
			name: name,
			email: email,
			phone: phone,
			password: password
		}, {
			where: { id }
		});

		const clientUpdated = await models.client.findByPk(id);

		return res.status(200).json({ message: 'Cliente actualizado exitosamente', cliente: clientUpdated });
	}
	// Solo se permite la actualización si el ID del cuerpo coincide con el ID de la URL.
	catch (error) {
		console.error('Error al actualizar cliente:', error);
		return res.status(500).json({ message: 'Error al actualizar cliente' });
	}
};

// Función para eliminar un registro de la base de datos por su ID.
// Busca el registro por el ID en la URL y lo elimina si existe.
async function remove(req, res) {
	return res.status(400).json({ message: 'No se puede eliminar un cliente.' });
	/*
	const id = getIdParam(req);  // Valida y obtiene el ID del parámetro de la URL.
	await models.client.destroy({  // Cambia 'client' por la entidad deseada.
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
};
