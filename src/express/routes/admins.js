// Importamos el objeto 'models' de Sequelize, que contiene todas las entidades del modelo de datos.
const { models } = require('../../sequelize');

// Importamos la función de ayuda para validar y obtener el ID de los parámetros de la solicitud.
const { getIdParam } = require('../helpers');

// Función para obtener todos los registros de la entidad.
// Realiza una consulta a la base de datos y devuelve los resultados en formato JSON.
async function getAll(req, res) {
	return res.status(400).json({ message: 'No se puede obtener un administrador.' });
	/*
	const entities = await models.admin.findAll();  // Cambia 'admin' por la entidad deseada.
	res.status(200).json(entities);  // Devuelve un estado 200 (éxito) junto con los datos.
	*/
};

// Función para obtener un registro específico por su ID.
// Valida el ID, busca el registro en la base de datos y lo devuelve en formato JSON.
async function getById(req, res) {
	return res.status(400).json({ message: 'No se puede obtener un administrador por ID.' });
	/*
	const id = getIdParam(req);  // Valida y convierte el ID a número.
	const entity = await models.admin.findByPk(id);  // Cambia 'admin' por la entidad deseada.
	if (entity) {
		res.status(200).json(entity);  // Si el registro existe, lo devuelve con un estado 200.
	} else {
		res.status(404).send('404 - No encontrado');  // Si no se encuentra, devuelve un error 404.
	}
	*/
};

// Función para crear un nuevo registro en la base de datos.
// Valida que el cuerpo de la solicitud no incluya un ID, ya que este se genera automáticamente.
async function create(req, res) {
	return res.status(400).json({ message: 'No se puede crear un administrador.' });
	/*
	if (req.body.id) {
		res.status(400).send('Solicitud incorrecta: no se debe proporcionar el ID, ya que se determina automáticamente por la base de datos.');
	} else {
		await models.admin.create(req.body);  // Cambia 'admin' por la entidad deseada.
		res.status(201).end();  // Devuelve un estado 201 (creado) y finaliza la respuesta.
	}
	*/
};

// Función para actualizar un registro existente.
// Acepta la actualización solo si el ID del parámetro de la URL coincide con el ID del cuerpo de la solicitud.
async function update(req, res) {
	return res.status(400).json({ message: 'No se puede actualizar un administrador.' });
	/*
	const id = getIdParam(req);  // Valida y obtiene el ID del parámetro de la URL.

	// Solo se permite la actualización si el ID del cuerpo coincide con el ID de la URL.
	if (req.body.id === id) {
		await models.admin.update(req.body, {  // Cambia 'admin' por la entidad deseada.
			where: {
				id: id  // Filtra la actualización por el ID proporcionado.
			}
		});
		res.status(200).end();  // Devuelve un estado 200 (éxito) y finaliza la respuesta.
	} else {
		res.status(400).send(`Solicitud incorrecta: el ID del parámetro (${id}) no coincide con el ID del cuerpo (${req.body.id}).`);
	}
	*/
};

// Función para eliminar un registro de la base de datos por su ID.
// Busca el registro por el ID en la URL y lo elimina si existe.
async function remove(req, res) {
	return res.status(400).json({ message: 'No se puede eliminar un administrador.' });
	/*
	const id = getIdParam(req);  // Valida y obtiene el ID del parámetro de la URL.
	await models.admin.destroy({  // Cambia 'admin' por la entidad deseada.
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
