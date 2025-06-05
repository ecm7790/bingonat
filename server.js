const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let jugadores = [];

io.on('connection', (socket) => {
  console.log('📡 Cliente conectado');

  // Registrar nuevo jugador
  socket.on('jugadorNuevo', (nombre) => {
    if (!jugadores.includes(nombre)) {
      jugadores.push(nombre);
      console.log(`👤 Jugador conectado: ${nombre}`);
      io.emit('actualizarJugadores', jugadores);
    }
  });

  // Iniciar la partida (desde sorteo)
  socket.on('comenzarPartida', () => {
    console.log('🚀 Partida iniciada');
    io.emit('habilitarJuego'); // los jugadores podrán generar su tabla
  });

  // Número sorteado
  socket.on('numeroSorteado', (numeroConLetra) => {
    console.log(`🎱 Número sorteado: ${numeroConLetra}`);
    io.emit('numeroSorteado', numeroConLetra);
  });

  // Ganador
  socket.on('ganador', (nombre) => {
    console.log(`🏆 Ganador: ${nombre}`);
    io.emit('anunciarGanador', nombre);
  });

  // Limpiar historial
  socket.on('limpiarHistorial', () => {
    console.log('🧹 Historial borrado');
    io.emit('limpiarHistorial');
  });

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado');
    // Opcional: eliminar nombre de jugadores[]
  });
});

http.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
