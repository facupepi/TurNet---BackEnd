// Importamos el objeto 'models' de Sequelize, que contiene todas las entidades del modelo de datos.
const { models } = require('../../sequelize');
// Importamos la librería 'bcryptjs' para encriptar contraseñas.
const bcryptjs = require('bcryptjs');
// Importamos la librería 'jsonwebtoken' para generar tokens de acceso.
const jwt = require('jsonwebtoken');
// Cargamos las variables de entorno desde el archivo '.env'.
import dotenv from 'dotenv';
dotenv.config();

// Importamos la función de ayuda para validar y obtener el ID de los parámetros de la solicitud.
const { corsHeaders, getIdParam , validateFormLogin, validateFormRegister} = require('../helpers');

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

async function auth(req, res) {
    const accessToken = req.cookies.accessToken;

    let id = jwt.decode(accessToken).id;

    const entity = await models.client.findByPk(id);  // Cambia 'client' por la entidad deseada.

    console.log("Entity: ", entity);
    if (entity) {
        res.status(200).json(entity);  // Si el registro existe, lo devuelve con un estado 200.
    } else {
        res.status(404).send('404 - No encontrado');  // Si no se encuentra, devuelve un error 404.
    }
}

async function logout(req, res) {
    res.clearCookie('accessToken');
    res.status(200).json({ message: 'Sesion Cerrada' });
}

// Función para obtener un registro específico por su Email.
// Valida el email, busca el registro en la base de datos y lo devuelve en formato JSON.
async function login(req, res) {
	const { email, password } = req.body;  // Valida y convierte el email y la contraseña.

	const formErrors = validateFormLogin(req.body);
	if (Object.keys(formErrors).length > 0) return res.status(400).json({ message: 'Error al iniciar sesion' , errors: formErrors, client: null });

	const client = await models.client.findOne({ where: { email } });  

	if (!client) {
		res.status(404).send({ message: 'Inicio de Sesion Fallido',  errors: {"client" : "Cliente No Encontrado"} , client: null });  // Si no se encuentra, devuelve un error 404.
	}
	else{
        let hashSaved = client.passwordHash;
        let passwordMatch = await bcryptjs.compare(password, hashSaved);
		if(passwordMatch){
            // Generar token de acceso
            const accessToken = jwt.sign( {id : client.id} , process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            
            //res.setHeader("Access-Control-Expose-Headers", "Authorization"); // Exponer el header 'Authorization'

            // Configuración de los encabezados HTTP para permitir solicitudes CORS (Cross-Origin Resource Sharing)
            res.header(corsHeaders);

            res.cookie('accessToken', accessToken, { maxAge: 24 * 60 * 60 * 1000 , httpOnly: true}); // Setear la cookie 'accessToken' con duración de 30 segundos

            //res.header('authorization', accessToken)
            res.status(200).json({ message: 'Inicio de Sesion Exitoso',  errors: {} , client: client });  // Si el registro existe, lo devuelve con un estado 200.
		}
		else{
			res.status(404).send({ message: 'Inicio de Sesion Fallido',  errors: {"client" : "Contraseña Incorrecta"} , client: null });  // Si no se encuentra, devuelve un error 404.
		}
	}
};

// Función para crear un nuevo registro en la base de datos.
// Valida que el cuerpo de la solicitud no incluya un ID, ya que este se genera automáticamente.
async function create(req, res) {
    const { first_name, last_name, email, phone, password } = req.body;

    try {
        // Validar los datos del formulario
        const formErrors = validateFormRegister(req.body);
        
        // Verificar que no exista un cliente con el mismo email
        const existingClient = await models.client.findOne({
            where: { email }
        });

        if (existingClient) formErrors.email = 'El email ya está registrado.';
        
        if (Object.keys(formErrors).length > 0) return res.status(400).json({ message: 'Error al crear cliente' , errors: formErrors, newCliente: null });
        
        let passwordHash = await bcryptjs.hash(password, 8);
        
        // Crear el nuevo cliente
        const newClient = await models.client.create({
            first_name,
            last_name,
            email,
            phone,
            passwordHash
        });

        return res.status(201).json({ message: 'Cliente creado exitosamente',  errors: {} , newClient: newClient });
    } catch (error) {
        console.error('Error al crear cliente:', error);
        return res.status(500).json({ message: 'Error al crear cliente' });
    }
};

// Función para actualizar un registro existente.
// Acepta la actualización solo si el ID del parámetro de la URL coincide con el ID del cuerpo de la solicitud.
async function update(req, res) {
	const {first_name, last_name, email, phone, password} = req.body;
	const {id} = req.params;  // Valida y obtiene el ID del parámetro de la URL.

	if(!id) {
		return res.status(400).json({ message: 'Debe proporcionar un ID.' });
	}

	if(!first_name && !last_name && !email && !phone && !password) {
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
			first_name: first_name,
			last_name: last_name,
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
	login, // Función para validar el inicio de sesión
    auth,
    logout
};

