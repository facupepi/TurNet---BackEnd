const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Admin = sequelize.define('admin', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, { tableName: 'admin' });

    // Hook para crear los admin automáticamente después de sincronizar la tabla
    Admin.afterSync(async () => {
        const count = await Admin.count(); // Verificar si ya existen registros
        if (count === 0) {
            await Admin.create({
                name: 'admin',
                email: 'admin@example.com',
                password: 'securepassword' // Cambiar por una contraseña segura
            });
            console.log('Admin creado con éxito');
        }
    });

    return Admin;
};