const { Server } = require("socket.io");

const PUERTO = process.env.PORT || 30001;

const io = new Server(PUERTO, {
    cors: { origin: "*" }
});

console.log(`[SERVIDOR] Iniciado en el puerto ${PUERTO}`);

io.on("connection", (socket) => {
    console.log(`🟢 Cliente conectado: ${socket.id}`);

    // 1. Unirse a la sala (sirve tanto para el móvil como para Foundry)
    socket.on("JOIN_ROOM", ({ roomId }) => {
        if (!roomId) return;
        socket.join(roomId);
        console.log(`👥 Socket ${socket.id} se unió a la sala: [${roomId}]`);
    });

    // 2. Petición de la App hacia Foundry (Pedir datos iniciales)
    socket.on("REQUEST_CHARACTER_DATA", (data) => {
        console.log(`📩 [${data.roomId}] Petición de datos para el personaje: ${data.characterId}`);
        // Reenviamos a todos los sockets de la sala (a Foundry) excepto al emisor
        socket.to(data.roomId).emit("REQUEST_CHARACTER_DATA", data);
    });

    // 3. Respuesta de Foundry hacia la App (Envío de la ficha completa)
    socket.on("CHARACTER_DATA", (data) => {
        console.log(`📤 [${data.roomId}] Datos de ficha recibidos de Foundry, enviando a la sala...`);
        // Emitimos a toda la sala para que la app reciba el objeto
        io.to(data.roomId).emit("CHARACTER_DATA", data);
    });

    // 4. Cambios de vida desde el Móvil hacia Foundry
    socket.on("UPDATE_HP", (data) => {
        console.log(`❤️ [${data.roomId}] Actualización de HP:`, data);
        socket.to(data.roomId).emit("UPDATE_HP", data);
    });

    socket.on("UPDATE_TEMP_HP", (data) => {
        console.log(`🛡️ [${data.roomId}] Actualización de Temp HP:`, data);
        socket.to(data.roomId).emit("UPDATE_TEMP_HP", data);
    });

    // 5. Cambios desde Foundry hacia el Móvil (cuando el DM o un efecto modifica la ficha)
    socket.on("CHARACTER_UPDATE", (data) => {
        console.log(`🔄 [${data.roomId}] Cambio en Foundry reenviado a la app:`, data);
        socket.to(data.roomId).emit("CHARACTER_UPDATE", data);
    });

    socket.on("disconnect", () => {
        console.log(`🔴 Cliente desconectado: ${socket.id}`);
    });
});