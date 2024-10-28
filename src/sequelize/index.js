// Importamos Sequelize, que es el ORM para gestionar la base de datos.
const { Sequelize } = require('sequelize');

// Importamos una función adicional que configurará asociaciones o cualquier configuración extra entre los modelos.
const { applyExtraSetup } = require('./extra-setup');

// En una aplicación real, se debe mantener la URL de conexión a la base de datos como una variable de entorno
// Ejemplo: const sequelize = new Sequelize(process.env.DB_CONNECTION_URL);

// Aquí configuramos Sequelize para que utilice SQLite como base de datos.
// La base de datos se almacena en un archivo local llamado 'db.sqlite'.
const sequelize = new Sequelize({
	dialect: 'sqlite',  // Definimos el dialecto a utilizar (SQLite en este caso).
	storage: 'db.sqlite',  // Especificamos la ubicación del archivo de la base de datos.
	logQueryParameters: true,  // Activa el registro de los parámetros de las consultas (útil para depuración).
	benchmark: true, // Muestra el tiempo que tarda cada consulta en ejecutarse (también útil para depuración).
});

// Definimos una lista de modelos que queremos incluir en la base de datos.
// Cada archivo en './models' representa un modelo diferente (como categoría, ítem, orden, etc.).
const modelDefiners = [
	require('./models/admin.model'),  // Importa el modelo 'admin'.
	require('./models/cliente.model'),  // Importa el modelo 'cliente'.
	//require('./models/dia.model'),  // Importa el modelo 'dia'.
	require('./models/horario.model'),  // Importa el modelo 'horario'.
	require('./models/horarios_laborales.model'),  // Importa el modelo 'horario'.
	require('./models/dias_laborales.model'),  // Importa el modelo 'dias_laborales'.
	require('./models/reserva.model'),  // Importa el modelo 'reserva'.
	require('./models/servicio.model'),  // Importa el modelo 'servicio'.
	// Puedes añadir más modelos aquí según los archivos disponibles en la carpeta 'models'.
	// require('./models/otroModelo'),
];

// Definimos todos los modelos de acuerdo con los archivos que hemos importado.
// Esta parte itera sobre cada modelo y lo inicializa dentro de Sequelize.
for (const modelDefiner of modelDefiners) {
	modelDefiner(sequelize);  // Se pasa la instancia de Sequelize para configurar el modelo.
}

// Ejecutamos cualquier configuración adicional, como la creación de asociaciones entre modelos (relaciones).
applyExtraSetup(sequelize);  // Por ejemplo, asociaciones entre tablas (relaciones uno a muchos, muchos a muchos, etc.).

// Exportamos la instancia de Sequelize para poder usarla en otras partes de la aplicación.
module.exports = sequelize;