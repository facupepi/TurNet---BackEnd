const { models } = require('../../sequelize');

async function getAvailableTimesByServiceAndDate(req, res) {
    const { id_service } = req.params;
    const { date } = req.query;

    try {
        // Validar los parámetros de la solicitud
        if (!date || !id_service) {
            return res.status(400).json({ message: 'Debe proporcionar la fecha y el id del servicio.' });
        }

        // Convertir la fecha solicitada a un objeto Date
        let requestedDate = new Date(date);

        // Forzar la hora a medianoche UTC para evitar desplazamientos por zona horaria
        requestedDate.setUTCHours(0, 0, 0, 0);

        // Validar que la fecha solicitada sea válida
        if (isNaN(requestedDate.getTime())) {
            return res.status(400).json({ message: 'La fecha proporcionada no es válida.' });
        }

        // Obtener los días laborables para el servicio
        const workDays = await models.work_days.findAll({
            where: { service_id: id_service }
        });

        console.log('Días laborales configurados:', workDays);

        // Obtener el día de la semana de la fecha solicitada (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
        const dayOfWeek = requestedDate.getUTCDay(); // Usamos getUTCDay() para obtener el día de la semana en UTC
        console.log('Día de la semana de la fecha solicitada:', dayOfWeek);

        // Convertir el número del día de la semana a un nombre de día en español
        const daysOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const dayName = daysOfWeek[dayOfWeek]; // Ejemplo: Si dayOfWeek es 5, dayName será "Viernes"
        console.log('Nombre del día de la semana:', dayName);

        // Verificar si la fecha solicitada es un día laboral
        const isWorkDay = workDays.some(workDay => workDay.name === dayName);

        if (!isWorkDay) {
            return res.status(404).json({ message: 'La fecha solicitada no es un día laboral para este servicio.' });
        }

        // Obtener los horarios de trabajo para el servicio
        const workSchedules = await models.work_schedules.findAll({
            where: { service_id: id_service },
            include: [{ model: models.schedule, attributes: ['time'] }]
        });

        console.log('Horarios de trabajo encontrados:', workSchedules);

        // Obtener las reservas para el servicio y la fecha solicitada
        const bookings = await models.booking.findAll({
            where: { service_id: id_service, date: date },
            include: [{ model: models.service, attributes: ['name', 'price'] }]
        });

        console.log('Reservas encontradas:', bookings);

        // Si no hay reservas, todos los horarios de trabajo están disponibles
        if (bookings.length === 0) {
            const availableTimes = workSchedules.map(schedule => schedule.schedule.time);
            console.log('Horarios disponibles (sin reservas):', availableTimes);
            return res.status(200).json({ availableTimes });
        }

        // Filtrar los horarios ocupados (ya reservados)
        const bookedTimes = bookings.map(booking => booking.time);
        console.log('Horarios reservados:', bookedTimes);

        const availableTimes = workSchedules
            .map(schedule => schedule.schedule.time)
            .filter(time => !bookedTimes.includes(time)); // Excluir los horarios ocupados

        // Si no hay horarios disponibles
        if (availableTimes.length === 0) {
            return res.status(404).json({ message: 'No hay horarios disponibles para la fecha y servicio especificados.' });
        }

        // Devolver los horarios disponibles
        console.log('Horarios disponibles:', availableTimes);
        return res.status(200).json({ availableTimes });
    } catch (error) {
        console.error('Error al obtener horarios disponibles:', error);
        return res.status(500).json({ message: 'Error al obtener horarios disponibles.' });
    }
}



async function getAllServices(req, res) {
    try {
        const services = await models.service.findAll();

        if (services.length === 0) {
            return res.status(404).json({ message: 'No se encontraron servicios.' });
        }

        const servicesWithDetails = await Promise.all(services.map(async (service) => {
            const workSchedules = await models.work_schedules.findAll({
                where: {
                    service_id: service.id,
                },
                include: [
                    {
                        model: models.schedule,
                        attributes: ['time']
                    }
                ]
            });

            const workDays = await models.work_days.findAll({
                where: {
                    service_id: service.id,
                }
            });

            return {
                service,
                workSchedules,
                workDays
            };
        }));

        return res.status(200).json({
            services: servicesWithDetails,
            message: 'Servicios encontrados exitosamente.'
        });
    } catch (error) {
        console.error('Error al obtener servicios:', error);
        return res.status(500).json({ message: 'Error al obtener servicios.' });
    }
}

async function createService(req, res) {
    const { name, price, duration, reservation_period, days, startTime, endTime } = req.body;

    if (!name || !price || !duration || !reservation_period || !startTime || !endTime) {
        return res.status(400).json({ message: 'Faltan parámetros obligatorios: name, price, duration, reservation_period, startTime, endTime.' });
    }

    const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    if (!days || days.length === 0) {
        return res.status(400).json({ message: 'Debe proporcionar al menos un día laboral.' });
    }

    const invalidDays = days.filter(day => !weekDays.includes(day));
    if (invalidDays.length > 0) {
        return res.status(400).json({ message: `Los siguientes días son inválidos: ${invalidDays.join(', ')}` });
    }

    try {
        // Crear el nuevo servicio
        const newService = await models.service.create({
            name: name,
            price: price,
            duration: duration,
            reservation_period: reservation_period
        });

        // Crear los días laborales para el nuevo servicio
        const workDays = days.map(day => ({
            service_id: newService.id,
            name: day
        }));

        const newWorkDays = await models.work_days.bulkCreate(workDays, { returning: true });

        // Generar los work schedules basados en la duración del servicio
        const durationMinutes = newService.duration; // Extraemos la duración del servicio (en minutos)

        // Convertimos la hora de inicio y fin a objetos Date para poder manipularlos
        const startTimeDate = new Date(`1970-01-01T${startTime}:00`);
        let endTimeDate = new Date(`1970-01-01T${endTime}:00`);

        // Si la hora de fin es menor a la hora de inicio, asumimos que cruza la medianoche y ajustamos la fecha
        if (endTimeDate <= startTimeDate) {
            endTimeDate.setDate(endTimeDate.getDate() + 1); // Avanzamos al día siguiente
        }

        // Inicializamos un array para almacenar los horarios generados
        let workSchedules = [];

        // Generamos los horarios a partir de la hora de inicio, incrementando según la duración del servicio
        let currentHour = startTimeDate;

        // Bucle que va generando los horarios hasta alcanzar o pasar la hora de fin
        while (currentHour <= endTimeDate) {
            // Convertimos la hora actual a formato "HH:MM:SS"
            const formattedTime = currentHour.toTimeString().slice(0, 8); // Aseguramos formato HH:MM:SS

            // Buscamos en la base de datos el horario que coincide con la hora generada
            const schedule = await models.schedule.findOne({
                where: { time: formattedTime }
            });

            // Si el schedule existe en la base de datos, lo agregamos a la lista de work schedules
            if (schedule) {
                workSchedules.push({
                    service_id: newService.id,
                    schedule_id: schedule.id, // Usamos el ID del schedule recuperado
                    time: formattedTime // También almacenamos la time formateada
                });
            }

            // Incrementamos la hora actual según la duración del servicio (en minutos)
            currentHour.setMinutes(currentHour.getMinutes() + durationMinutes);
        }

        // Verificamos si se generaron work schedules
        if (workSchedules.length === 0) {
            return res.status(404).json({ message: 'No se encontraron horarios dentro del rango especificado.' });
        }

        // Usamos bulkCreate para insertar todos los registros en la tabla 'work_schedules'
        await models.work_schedules.bulkCreate(
            workSchedules.map(schedule_temp => ({
                service_id: schedule_temp.service_id,
                schedule_id: schedule_temp.schedule_id
            }))
        );

        // Respondemos con éxito, incluyendo los horarios generados en el mensaje
        return res.status(201).json({
            message: 'Servicio, días laborales y horarios creados exitosamente',
            service: newService,
            workDays: newWorkDays.map(newWorkDay => ({
                service_id: newWorkDay.service_id,
                name: newWorkDay.name
            })),
            workSchedules: workSchedules.map(schedule_temp => ({
                schedule_id: schedule_temp.schedule_id,
                time: schedule_temp.time
            })) // Incluimos tanto el ID como la time
        });

    } catch (error) {
        // Manejamos cualquier error que ocurra durante la ejecución
        console.error('Error al crear el servicio, días laborales y horarios:', error);
        return res.status(500).json({ message: 'Error al crear el servicio, días laborales y horarios', error: error });
    }
}

module.exports = {
    getAllServices,
    createService,
    getAvailableTimesByServiceAndDate
};


/*
async function update(req, res) {
    const { name, price, duration, reservation_period, days, startTime, endTime } = req.body;
    const { id } = req.params;

    if (!name || !price || !duration || !reservation_period || !startTime || !endTime) {
        return res.status(400).json({ message: 'Faltan parámetros obligatorios: name, price, duration, reservation_period, startTime, endTime.' });
    }

    const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    if (!days || days.length === 0) {
        return res.status(400).json({ message: 'Debe proporcionar al menos un día laboral.' });
    }

    const invalidDays = days.filter(day => !weekDays.includes(day));
    if (invalidDays.length > 0) {
        return res.status(400).json({ message: `Los siguientes días son inválidos: ${invalidDays.join(', ')}` });
    }

    try {
        const service = await models.service.findByPk(id);
        if (!service) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        const previousDuration = service.duration;
        const previousStartTime = service.startTime;
        const previousEndTime = service.endTime;

        await models.service.update(req.body, {
            where: { id: id }
        });

        const updatedService = await models.service.findByPk(id);

        // Verificar si los días, la duración o las horas de inicio y fin han cambiado
        const currentWorkDays = await models.work_days.findAll({
            where: { service_id: id }
        });

        const currentDays = currentWorkDays.map(workDay => workDay.name);
        const daysChanged = currentDays.length !== days.length || currentDays.some(day => !days.includes(day));
        const durationChanged = previousDuration !== duration;
        const timeChanged = previousStartTime !== startTime || previousEndTime !== endTime;

        if (daysChanged || durationChanged || timeChanged) {
            // Eliminar todos los días laborales y horarios laborales existentes para el servicio
            await models.work_days.destroy({
                where: { service_id: id }
            });

            await models.work_schedules.destroy({
                where: { service_id: id }
            });

            // Crear los nuevos días laborales
            const workDays = days.map(day => ({
                service_id: id,
                name: day
            }));

            const newWorkDays = await models.work_days.bulkCreate(workDays, { returning: true });

            // Generar los work schedules basados en la duración del servicio
            const durationMinutes = updatedService.duration; // Extraemos la duración del servicio (en minutos)

            // Convertimos la hora de inicio y fin a objetos Date para poder manipularlos
            const startTimeDate = new Date(`1970-01-01T${startTime}:00`);
            let endTimeDate = new Date(`1970-01-01T${endTime}:00`);

            // Si la hora de fin es menor a la hora de inicio, asumimos que cruza la medianoche y ajustamos la fecha
            if (endTimeDate <= startTimeDate) {
                endTimeDate.setDate(endTimeDate.getDate() + 1); // Avanzamos al día siguiente
            }

            // Inicializamos un array para almacenar los horarios generados
            let workSchedules = [];

            // Generamos los horarios a partir de la hora de inicio, incrementando según la duración del servicio
            let currentHour = startTimeDate;

            // Bucle que va generando los horarios hasta alcanzar o pasar la hora de fin
            while (currentHour <= endTimeDate) {
                // Convertimos la hora actual a formato "HH:MM:SS"
                const formattedTime = currentHour.toTimeString().slice(0, 8); // Aseguramos formato HH:MM:SS

                // Buscamos en la base de datos el horario que coincide con la hora generada
                const schedule = await models.schedule.findOne({
                    where: { time: formattedTime }
                });

                // Si el schedule existe en la base de datos, lo agregamos a la lista de work schedules
                if (schedule) {
                    workSchedules.push({
                        service_id: id,
                        schedule_id: schedule.id, // Usamos el ID del schedule recuperado
                        time: formattedTime // También almacenamos la time formateada
                    });
                }

                // Incrementamos la hora actual según la duración del servicio (en minutos)
                currentHour.setMinutes(currentHour.getMinutes() + durationMinutes);
            }

            // Verificamos si se generaron work schedules
            if (workSchedules.length === 0) {
                return res.status(404).json({ message: 'No se encontraron horarios dentro del rango especificado.' });
            }

            // Usamos bulkCreate para insertar todos los registros en la tabla 'work_schedules'
            await models.work_schedules.bulkCreate(
                workSchedules.map(schedule_temp => ({
                    service_id: schedule_temp.service_id,
                    schedule_id: schedule_temp.schedule_id
                }))
            );

            // Respondemos con éxito, incluyendo los horarios generados en el mensaje
            return res.status(200).json({
                message: 'Servicio, días laborales y horarios actualizados exitosamente',
                service: updatedService,
                workDays: newWorkDays.map(newWorkDay => ({
                    service_id: newWorkDay.service_id,
                    name: newWorkDay.name
                })),
                workSchedules: workSchedules.map(schedule_temp => ({
                    schedule_id: schedule_temp.schedule_id,
                    time: schedule_temp.time
                })) // Incluimos tanto el ID como la time
            });
        }

        const work_schedules = await models.work_schedules.findAll({
            where: { service_id: id },
            include: [
                {
                    model: models.schedule, // Incluye la entidad 'schedule'.
                    attributes: ['time'] // Especifica que solo quieres obtener el campo 'time'.
                }
            ]
        });

        return res.status(200).json({
            message: 'Servicio actualizado correctamente.',
            service: updatedService,
            work_schedules: work_schedules
        });
    } catch (error) {
        console.error('Error al actualizar el servicio:', error);
        return res.status(500).json({ message: 'Error al actualizar el servicio.' });
    }
}


async function remove(req, res) {
    return res.status(400).json({ message: 'No se puede eliminar un servicio.' });
    const id = getIdParam(req);
    await models.service.destroy({
        where: { id: id }
    });
    res.status(200).end();
}

async function getById(req, res) {
    const { id } = req.params; // Obtiene el ID del servicio de los parámetros de la solicitud.
    if (!id) {
        return res.status(400).json({ message: 'Debe proporcionar el id del servicio.' });
    }

    const serviceTemp = await models.service.findByPk(id);

    console.log(id);
    console.log(JSON.stringify(serviceTemp));

    if (serviceTemp) {
        
    
    const workSchedules = await models
        .work_schedules
        .findAll({
            where: {
                    service_id: id, // Filtra los registros por ID dservicio.
            },
                include: [
                {
                    model: models.schedule, // Incluye la entidad 'schedule'.
                    attributes: ['time'] // Especifica que solo quiereobtener el campo 'time'.
                }
            ]
        });

        const workDays = await models.work_days.findAll({
            where: {
                service_id: id,  // Filtra los registros por ID de servicio.
            }
        });

        return res.status(200).json({
            service: serviceTemp,
            workSchedules: workSchedules,
            workDays: workDays,
            message: 'Servicio encontrado exitosamente.'
        });
        } else {
            res.status(404).send('404 - Not found');
        }   
    
}

async function getServiceBookingsByDay(req, res) {
    const { id_service } = req.params;
    const { date } = req.query;

    try {
        if (!date || !id_service) {
            return res.status(400).json({ message: 'Debe proporcionar la fecha y el id del servicio.' });
        }

        const bookings = await models.booking.findAll({
            where: {
                service_id: id_service,
                date: date
            },
            include: [
                {
                    model: models.service,
                    attributes: ['name', 'price']
                }
            ]
        });

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'No se encontraron reservas para la fecha y service especificados.' });
        }

        return res.status(200).json(bookings);
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        return res.status(500).json({ message: 'Error al obtener reservas.' });
    }
}
*/