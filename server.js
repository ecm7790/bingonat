const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = 3000;

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado');

  socket.on('ganador', (nombre) => {
    console.log(`🏆 Ganador recibido: ${nombre}`);
    io.emit('anunciarGanador', nombre);
  });

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado');
  });
});

http.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
io.emit('numeroSorteado', `${letra}${num}`);
