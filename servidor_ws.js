const { Server } = require("socket.io");

const PUERTO = process.env.PORT || 30001;

const io = new Server(PUERTO, {
    cors: { origin: "*" }
});

console.log(`[SERVIDOR] Iniciado en el puerto ${PUERTO}`);

io.on("connection", (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    socket.on("unirse_partida", (nombreSala) => {
        socket.join(nombreSala);
        console.log(`Cliente ${socket.id} ha entrado en la sala: ${nombreSala}`);
    });

    socket.on("orden_desde_movil", (datos) => {
        console.log(`Orden recibida para la sala [${datos.sala}]:`, datos.payload);

        io.to(datos.sala).emit("orden_para_foundry", datos.payload);
    });

    socket.on("datos_desde_foundry", (datos) => {
        console.log(`Datos de Foundry enviados a la sala [${datos.sala}]`);
        io.to(datos.sala).emit("datos_para_movil", datos.payload);
    });

    socket.on("disconnect", () => {
        console.log(`Cliente desconectado: ${socket.id}`);
    });
});
