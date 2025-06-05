
const socket = io();
const listaJugadores = document.getElementById('listaJugadores');
const btnComenzar = document.getElementById('btnComenzar');
const sortearBtn = document.getElementById('sortearBtn');
const limpiarBtn = document.getElementById('limpiarBtn');
const numeroSorteado = document.getElementById('numeroSorteado');
const listaUltimos = document.getElementById('listaUltimos');

let numerosDisponibles = Array.from({length: 75}, (_, i) => i + 1);
let historial = [];

// Emitir comenzar partida
btnComenzar.addEventListener('click', () => {
  socket.emit('comenzarPartida');
});

// Sortear número
sortearBtn.addEventListener('click', () => {
  if (numerosDisponibles.length === 0) return alert("¡Fin del juego!");
  const index = Math.floor(Math.random() * numerosDisponibles.length);
  const num = numerosDisponibles.splice(index, 1)[0];
  const letra = obtenerLetra(num);
  const combinado = `${letra}${num}`;
  numeroSorteado.textContent = combinado;
  historial.unshift(combined);
  if (historial.length > 5) historial.pop();
  actualizarListaUltimos();
  socket.emit('numeroSorteado', combinado);
});

// Limpiar historial
limpiarBtn.addEventListener('click', () => {
  numerosDisponibles = Array.from({length: 75}, (_, i) => i + 1);
  historial = [];
  numeroSorteado.textContent = '--';
  actualizarListaUltimos();
  socket.emit('limpiarHistorial');
});

// Mostrar letra
function obtenerLetra(num) {
  if (num <= 15) return 'B';
  if (num <= 30) return 'I';
  if (num <= 45) return 'N';
  if (num <= 60) return 'G';
  return 'O';
}

// Mostrar últimos números en vertical
function actualizarListaUltimos() {
  listaUltimos.innerHTML = '';
  historial.forEach((n, i) => {
    const li = document.createElement('li');
    li.textContent = n;
    li.style.display = 'block';
    if (i === 0) li.classList.add('ultimo-numero');
    listaUltimos.appendChild(li);
  });
}

// Recibir jugadores
socket.on('actualizarJugadores', (jugadores) => {
  listaJugadores.innerHTML = '';
  jugadores.forEach(nombre => {
    const li = document.createElement('li');
    li.textContent = nombre;
    listaJugadores.appendChild(li);
  });
});
