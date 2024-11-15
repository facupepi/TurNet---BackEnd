// Función de ayuda para validar y convertir el parámetro ':id' de la solicitud.
// Por defecto, los parámetros de la URL vienen como strings, 
// pero necesitamos que el 'id' sea un número para realizar operaciones correctas.

const jwt = require('jsonwebtoken');

import dotenv from 'dotenv';
dotenv.config();

function getIdParam(req) {
    // Extraemos el parámetro 'id' de los parámetros de la solicitud (req.params).
    const id = req.params.id;

    // Validamos que el 'id' sea un número entero positivo utilizando una expresión regular.
    // La expresión regular /^\d+$/ se asegura de que el 'id' solo contenga dígitos (0-9).
    if (/^\d+$/.test(id)) {
        // Si el 'id' es válido (es un número entero positivo), lo convertimos de string a número usando parseInt.
        // La base 10 se pasa como segundo argumento para asegurar que estamos trabajando con números decimales.
        return Number.parseInt(id, 10);
    }

    // Si la validación falla (es decir, el 'id' no es un número entero), lanzamos un error de tipo 'TypeError'.
    // Esto permite manejar el error en el código que llama a esta función, como una mala solicitud (400).
    throw new TypeError(`Invalid ':id' param: "${id}"`);
}

// Exportamos la función para que pueda ser usada en otros módulos.

const validateToken = (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) return res.status(401).json({ message: 'Acesso Denegado.', errors : {token : 'Token invalido o vencido.'} });

    try {
        const validToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        console.log("\nToken Valido: ", validToken);
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Acesso Denegado.', errors : {token : 'Token invalido o vencido.'} });
    }
};

// Función para validar los datos del formulario

const validateFormRegister = (formData) => {
    let formErrors = {};
    
    if (!formData.first_name) {
        formErrors.first_name = 'El nombre es obligatorio.';
    } else if (!/^[a-zA-Z]+$/.test(formData.first_name)) {
        formErrors.first_name = 'El nombre solo puede contener caracteres alfabéticos.';
    } else if (formData.first_name.length < 2) {
        formErrors.first_name = 'El nombre debe tener al menos 2 caracteres.';
    } else if (formData.first_name.length > 50) {
        formErrors.first_name = 'El nombre no puede tener más de 50 caracteres.';
    }
    
    if (!formData.last_name) {
        formErrors.last_name = 'El apellido es obligatorio.';
    } else if (!/^[a-zA-Z]+$/.test(formData.last_name)) {
        formErrors.last_name = 'El apellido solo puede contener caracteres alfabéticos.';
    } else if (formData.last_name.length < 2) {
        formErrors.last_name = 'El apellido debe tener al menos 2 caracteres.';
    } else if (formData.last_name.length > 50) {
        formErrors.last_name = 'El apellido no puede tener más de 50 caracteres.';
    }
    
    if (!formData.phone) {
        formErrors.phone = 'El teléfono es obligatorio.';
    } else if (!/^\d+$/.test(formData.phone)) {
        formErrors.phone = 'El teléfono solo puede contener números.';
    } else if (formData.phone.length < 7) {
        formErrors.phone = 'El teléfono debe tener al menos 7 caracteres.';
    } else if (formData.phone.length > 15) {
        formErrors.phone = 'El teléfono no puede tener más de 15 caracteres.';
    }

    if (!formData.email) {
        formErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        formErrors.email = 'El correo electrónico no es válido.';
    } else if (formData.email.length < 5) {
        formErrors.email = 'El correo electrónico debe tener al menos 5 caracteres.';
    } else if (formData.email.length > 50) {
        formErrors.email = 'El correo electrónico no puede tener más de 50 caracteres.';
    }

    if (!formData.password) {
        formErrors.password = 'La contraseña es obligatoria.';
    } else if (formData.password.length < 8) {
        formErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
    } else if (formData.password.length > 50) {
        formErrors.password = 'La contraseña no puede tener más de 50 caracteres.';
    }

    return formErrors;
};

const validateFormLogin = (formData) => {
    let formErrors = {};

    if (!formData.email) {
        formErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        formErrors.email = 'El correo electrónico no es válido.';
    } 

    if (!formData.password) {
        formErrors.password = 'La contraseña es obligatoria.';
    } 

    return formErrors;
};


const corsHeaders = {
    "Access-Control-Allow-Origin": process.env.FRONTEND_URL,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE"
};

module.exports = { corsHeaders, getIdParam , validateToken , validateFormRegister , validateFormLogin  };

