const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const horario = sequelize.define('horario', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        hora: {
            type: DataTypes.TIME,
            allowNull: false // Hora específica de trabajo
        }
    });

    // Hook para crear los horarios automáticamente después de sincronizar la tabla
    horario.afterSync(async () => {
        const count = await horario.count(); // Verificar si ya existen registros
        if (count === 0) {
            const horarios = [];
            let hours = 0;
            let minutes = 0;

            // Crear horarios desde las 00:00 hasta las 23:55 con separación de 5 minutos
            while (hours < 24) {
                const hora = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
                //hours.toString().padStart(2, '0')
                //Convierte la variable hours a una cadena y la formatea para que siempre tenga al menos 2 dígitos, agregando un '0' al inicio si es necesario 
                //(por ejemplo, 00, 01, 02, ..., 23).
                //minutes.toString().padStart(2, '0') hace lo mismo para los minutos
                
                horarios.push({ hora });

                minutes += 5;
                if (minutes === 60) {
                    minutes = 0;
                    hours++;
                }
            }

            await horario.bulkCreate(horarios);
            console.log('Horarios creados con éxito');
        }
    });

    return horario;
};
