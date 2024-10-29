const {DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    const schedule = sequelize.define('schedule', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        time: {
            type: DataTypes.TIME,
            allowNull: false
        }
    }, {tableName: 'schedule'});

    // Hook para crear los horarios automáticamente después de sincronizar la tabla
    schedule.afterSync(async() => {
        const count = await schedule.count(); // Verificar si ya existen registros
        if (count === 0) {
            const schedules = [];
            let hours = 0;
            let minutes = 0;

            // Crear horarios desde las 00:00 hasta las 23:55 con separación de 5 minutos
            while (hours < 24) {
                const time = `${hours
                    .toString()
                    .padStart(2, '0')}:${minutes
                    .toString()
                    .padStart(2, '0')}:00`;
                // hours.toString().padStart(2, '0') Convierte la variable hours a una cadena y
                // la formatea para que siempre tenga al menos 2 dígitos, agregando un '0' al
                // inicio si es necesario (por ejemplo, 00, 01, 02, ..., 23).
                // minutes.toString().padStart(2, '0') hace lo mismo para los minutos

                schedules.push({time});

                minutes += 1;
                if (minutes === 60) {
                    minutes = 0;
                    hours++;
                }
            }

            await schedule.bulkCreate(schedules);
            console.log('Horarios creados con éxito');
        }
    });

    return schedule;
};
