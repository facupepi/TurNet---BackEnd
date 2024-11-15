// Importamos la aplicación Express desde el archivo correspondiente.
const app = require('./express/app');

// Importamos la instancia de Sequelize, que manejará la conexión a la base de datos.
const sequelize = require('./sequelize');

// Carga las variables de entorno
import dotenv from 'dotenv';
dotenv.config();

// Define el puerto
const PORT = process.env.PORT; // Añade un valor por defecto si es necesario
console.log(PORT);

// Función para verificar si la conexión con la base de datos es correcta.
async function assertDatabaseConnectionOk() {
	console.log(`Checking database connection...`); // Indicamos que se está verificando la conexión.
	try {
		// Intentamos autenticar la conexión con la base de datos.
		await sequelize.authenticate();
		console.log('Database connection OK!'); // Si la conexión es exitosa, mostramos un mensaje.
	} catch (error) {
		// Si hay un error al conectar, lo capturamos y mostramos un mensaje de error.
		console.log('Unable to connect to the database:');
		console.log(error.message); // Imprimimos el mensaje de error.
		process.exit(1); // Finalizamos el proceso con código de error.
	}
}

// Función principal para inicializar la aplicación.
async function init() {
	// Verificamos que la conexión a la base de datos esté bien.
	await assertDatabaseConnectionOk();

    // Sincronizamos los modelos con la base de datos, creando las tablas si no existen.
    await sequelize.sync();

	console.log(`Starting Sequelize + Express on port ${PORT}...`);

    // Iniciamos el servidor Express en el puerto especificado.
    app.listen(PORT, () => {
		console.log(`Express server started on port ${PORT}.`); // Mensaje que indica que el servidor ha iniciado.
	});
}

// Llamamos a la función 'init' para iniciar el proceso.
init();

