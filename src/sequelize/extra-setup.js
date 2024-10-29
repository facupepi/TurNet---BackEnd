function applyExtraSetup(sequelize) {
    const {
        client,
        booking,
        service,
        schedule,
        work_schedules,
        work_days
    } = sequelize.models;

    // Relación uno a muchos entre 'Reserva' y 'Cliente'.
    client.hasMany(booking, {
        foreignKey: 'client_id', // id_cliente -> id_client
        onDelete: 'CASCADE' // Si se elimina un cliente, sus reservas también se eliminan.
    });
    booking.belongsTo(client, {foreignKey: 'client_id'});

    // Relación uno a muchos entre 'Reserva' y 'Servicio'.
    service.hasMany(booking, {
        foreignKey: 'service_id', // id_servicio -> id_service
        onDelete: 'CASCADE'
    });
    booking.belongsTo(service, {foreignKey: 'service_id'});

    // Relación muchos a muchos entre 'Horario' y 'Servicio' a través de 'work_schedules'.
    service.belongsToMany(schedule, {
        through: 'work_schedules',
        foreignKey: 'service_id',
        otherKey: 'schedule_id',
        onDelete: 'CASCADE'
    });
    schedule.belongsToMany(service, {
        through: 'work_schedules',
        foreignKey: 'schedule_id',
        otherKey: 'service_id',
        onDelete: 'CASCADE'
    });

    // Configuración de relaciones adicionales en 'work_schedules'.
    work_schedules.belongsTo(service, {foreignKey: 'service_id'});
    work_schedules.belongsTo(schedule, {foreignKey: 'schedule_id'});

    // Relación entre 'Días Laborales' y 'Servicio'.
    work_days.belongsTo(service, {foreignKey: 'service_id'});
}

module.exports = {
    applyExtraSetup
};
