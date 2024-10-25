const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    // Definimos el modelo 'dia'
    const dia = sequelize.define('dia', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false // Nombre del día (ej. Lunes, Martes, etc.)
        }
    }, {
        tableName: 'dia', // Nombre de la tabla en la base de datos
      });

    // Hook 'afterSync' para insertar los días de la semana automáticamente después de la creación de la tabla
    dia.afterSync(async (options) => {
        const count = await dia.count(); // Verificamos si ya existen días en la tabla
        
        if (count === 0) {
            const dias = [
                { nombre: 'Domingo' },
                { nombre: 'Lunes' },
                { nombre: 'Martes' },
                { nombre: 'Miércoles' },
                { nombre: 'Jueves' },
                { nombre: 'Viernes' },
                { nombre: 'Sábado' }
            ];
            await dia.bulkCreate(dias); // Insertamos los días de la semana
            console.log('Días de la semana creados automáticamente');
        }
    });

    return dia;
};
