
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
function generarTablaSorteo() {
  const tbody = document.querySelector('#tablaBingo tbody');
  tbody.innerHTML = '';
  const columnas = {
    B: generarNumeros(1, 15),
    I: generarNumeros(16, 30),
    N: generarNumeros(31, 45),
    G: generarNumeros(46, 60),
    O: generarNumeros(61, 75)
  };

  for (let fila = 0; fila < 5; fila++) {
    const tr = document.createElement('tr');
    ['B', 'I', 'N', 'G', 'O'].forEach((col, colIndex) => {
      const td = document.createElement('td');
      if (col === 'N' && fila === 2) {
        td.textContent = 'Free';
        td.classList.add('resaltado');
      } else {
        td.textContent = columnas[col][fila >= 2 && col === 'N' ? fila - 1 : fila];
        td.id = `cell-${td.textContent}`;
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }
}

function generarNumeros(min, max) {
  const nums = [];
  while (nums.length < 5) {
    const n = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!nums.includes(n)) nums.push(n);
  }
  return nums;
}

// Llamar al cargar
window.addEventListener('DOMContentLoaded', generarTablaSorteo);
