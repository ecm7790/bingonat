const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde la carpeta public
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('📡 Cliente conectado');

  // Evento cuando alguien gana el bingo
  socket.on('ganador', (nombre) => {
    console.log(`🏆 Ganador recibido: ${nombre}`);
    io.emit('anunciarGanador', nombre);
  });

  // Evento cuando se sortea un número desde el tablero principal
  socket.on('numeroSorteado', (numConLetra) => {
    console.log(`🎱 Número sorteado: ${numConLetra}`);
    io.emit('numeroSorteado', numConLetra);
  });

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado');
  });
});

// Iniciar servidor
http.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
let jugadores = [];

io.on('connection', (socket) => {
  socket.on('jugadorNuevo', (nombre) => {
    if (!jugadores.includes(nombre)) {
      jugadores.push(nombre);
      io.emit('actualizarJugadores', jugadores);
    }
  });

  socket.on('ganador', (nombre) => {
    io.emit('anunciarGanador', nombre);
  });

  socket.on('numeroSorteado', (n) => {
    io.emit('numeroSorteado', `${letra}${num}`);

  });

  socket.on('limpiarHistorial', () => {
    io.emit('limpiarHistorial');
  });

  socket.on('disconnect', () => {
    // (opcional) eliminar jugador si quieres mantener lista en tiempo real
  });
});
