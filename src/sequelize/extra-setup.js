function applyExtraSetup(sequelize) {
    // Desestructuramos los modelos de la instancia de Sequelize.
    const {
        cliente,
        reserva,
        servicio,
        horario,
        horarios_laborales,
        dias_laborales
    } = sequelize.models;

    // Relación entre 'Reserva' y 'Cliente' (uno a muchos).
    cliente.hasMany(reserva, {
        foreignKey: 'id_cliente',
        onDelete: 'CASCADE' // Si se elimina un cliente, también se eliminan sus reservas.
    });
    reserva.belongsTo(cliente, {foreignKey: 'id_cliente'});

    // Relación entre 'Reserva' y 'Servicio' (uno a muchos).
    servicio.hasMany(reserva, {
        foreignKey: 'id_servicio',
        onDelete: 'CASCADE'
    });
    reserva.belongsTo(servicio, {foreignKey: 'id_servicio'});

    // Relación muchos a muchos entre 'Horario' y 'Servicio' a través de
    // 'horarios_laborales'.
    servicio.belongsToMany(horario, {
        through: 'horarios_laborales', // Nombre del modelo intermedio.
        foreignKey: 'id_servicio',
        otherKey: 'id_horario',
        onDelete: 'CASCADE'
    });
    horario.belongsToMany(servicio, {
        through: 'horarios_laborales', // Nombre del modelo intermedio.
        foreignKey: 'id_horario',
        otherKey: 'id_servicio',
        onDelete: 'CASCADE'
    });

    horarios_laborales.belongsTo(servicio, {foreignKey: 'id_servicio'});
    horarios_laborales.belongsTo(horario, {foreignKey: 'id_horario'});

    dias_laborales.belongsTo(servicio, { foreignKey: 'id_servicio' });
    
}

module.exports = {
    applyExtraSetup
};
