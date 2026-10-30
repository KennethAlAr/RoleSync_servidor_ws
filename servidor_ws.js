const { Server } = require("socket.io");

const PUERTO = process.env.PORT || 30001;

const io = new Server(PUERTO, {
    cors: { origin: "*" }
});

console.log(`[SERVIDOR] Iniciado en el puerto ${PUERTO}`);

io.on("connection", (socket) => {
    console.log(`🟢 Cliente conectado: ${socket.id}`);

    // 1. Unirse a la sala
    socket.on("JOIN_ROOM", ({ roomId }) => {
        if (!roomId) return;
        socket.join(roomId);
        console.log(`👥 Socket ${socket.id} se unió a la sala: [${roomId}]`);
    });

    // 2. Petición de la App hacia Foundry (Pedir datos iniciales)
    socket.on("REQUEST_CHARACTER_DATA", (data) => {
        console.log(`📩 [${data.roomId}] Petición de datos para el personaje: ${data.characterId}`);
        socket.to(data.roomId).emit("REQUEST_CHARACTER_DATA", data);
    });

    // 3. Respuesta fragmentada de Foundry hacia la App (Hidratación inicial)
    socket.on("PLAYER_INFO", (data) => {
        console.log(`📤 [${data.roomId}] Info de Jugador recibida, reenviando a la app...`);
        socket.to(data.roomId).emit("PLAYER_INFO", data);
    });

    socket.on("HEALTH_INFO", (data) => {
        console.log(`📤 [${data.roomId}] Info de Salud recibida, reenviando a la app...`);
        socket.to(data.roomId).emit("HEALTH_INFO", data);
    });

    socket.on("SAVING_THROWS_INFO", (data) => {
        console.log(`📤 [${data.roomId}] Info de Salvaciones recibida, reenviando a la app...`);
        socket.to(data.roomId).emit("SAVING_THROWS_INFO", data);
    });

    // 4. Cambios en vivo desde Foundry hacia el Móvil (DM o efectos)
    socket.on("HEALTH_UPDATE", (data) => {
        console.log(`🔄 [${data.roomId}] Cambio de Vida en Foundry reenviado a la app:`, data);
        socket.to(data.roomId).emit("HEALTH_UPDATE", data);
    });

    // 5. Cambios de vida desde el Móvil hacia Foundry
    socket.on("UPDATE_HP", (data) => {
        console.log(`❤️ [${data.roomId}] Actualización de HP:`, data);
        socket.to(data.roomId).emit("UPDATE_HP", data);
    });

    socket.on("UPDATE_TEMP_HP", (data) => {
        console.log(`🛡️ [${data.roomId}] Actualización de Temp HP:`, data);
        socket.to(data.roomId).emit("UPDATE_TEMP_HP", data);
    });

    socket.on("disconnect", () => {
        console.log(`🔴 Cliente desconectado: ${socket.id}`);
    });

    socket.on("ROLL_INITIATIVE", (data) => {
        console.log(`🎲 [${data.roomId}] Petición de Iniciativa para el personaje: ${data.characterId}`);
        socket.to(data.roomId).emit("ROLL_INITIATIVE", data);
    });
});