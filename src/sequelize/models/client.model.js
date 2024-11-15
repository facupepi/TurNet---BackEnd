const {DataTypes} = require('sequelize');
const bcryptjs = require('bcryptjs');

module.exports = (sequelize) => {
    const Client = sequelize.define('client', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {tableName: 'client',});

    // Hook para crear los admin automáticamente después de sincronizar la tabla
    Client.afterSync(async () => {
        const count = await Client.count(); // Verificar si ya existen registros
        const passwordHash = await bcryptjs.hash('12345678', 8); // Cambiar por una contraseña segura
        if (count === 0) {
            await Client.create({
                first_name: 'admin',
                last_name: 'admin',
                phone: '12345678',
                email: 'admin@example.com',
                role: 'admin',
                passwordHash: passwordHash // Cambiar por una contraseña segura
            });
            console.log('Admin creado con éxito');
        }
    });
};
