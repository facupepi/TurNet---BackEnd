// Función de ayuda para validar y convertir el parámetro ':id' de la solicitud.
// Por defecto, los parámetros de la URL vienen como strings, 
// pero necesitamos que el 'id' sea un número para realizar operaciones correctas.

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
module.exports = { getIdParam };
