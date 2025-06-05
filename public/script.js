
const socket = io();
const listaJugadores = document.getElementById('listaJugadores');
const btnComenzar = document.getElementById('btnComenzar');
const sortearBtn = document.getElementById('sortearBtn');
const limpiarBtn = document.getElementById('limpiarBtn');
const numeroSorteado = document.getElementById('numeroSorteado');
let numerosDisponibles = Array.from({length: 75}, (_, i) => i + 1);

btnComenzar.addEventListener('click', () => {
  socket.emit('comenzarPartida');
});

sortearBtn.addEventListener('click', sortearNumero);
limpiarBtn.addEventListener('click', () => {
  numerosDisponibles = Array.from({length: 75}, (_, i) => i + 1);
  numeroSorteado.textContent = '--';
  socket.emit('limpiarHistorial');
});

function sortearNumero() {
  if (numerosDisponibles.length === 0) return alert("¡Fin del juego!");
  const index = Math.floor(Math.random() * numerosDisponibles.length);
  const num = numerosDisponibles.splice(index, 1)[0];
  const letra = obtenerLetra(num);
  const combinado = `${letra}${num}`;
  numeroSorteado.textContent = combinado;
  socket.emit('numeroSorteado', combinado);
}

function obtenerLetra(num) {
  if (num <= 15) return 'B';
  if (num <= 30) return 'I';
  if (num <= 45) return 'N';
  if (num <= 60) return 'G';
  return 'O';
}

socket.on('actualizarJugadores', (jugadores) => {
  listaJugadores.innerHTML = '';
  jugadores.forEach(nombre => {
    const li = document.createElement('li');
    li.textContent = nombre;
    listaJugadores.appendChild(li);
  });
});
