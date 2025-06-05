const socket = io();

const listaJugadores = document.getElementById('listaJugadores');
const btnComenzar = document.getElementById('btnComenzar');
const sortearBtn = document.getElementById('sortearBtn');
const limpiarBtn = document.getElementById('limpiarBtn');
const numeroSorteado = document.getElementById('numeroSorteado');
const listaUltimos = document.getElementById('listaUltimos');

let numerosDisponibles = Array.from({ length: 75 }, (_, i) => i + 1);
let historial = [];

function generarTablaSorteo() {
  const tbody = document.querySelector('#tablaBingo tbody');
  tbody.innerHTML = '';
  for (let fila = 0; fila < 15; fila++) {
    const tr = document.createElement('tr');
    for (let col = 0; col < 5; col++) {
      const td = document.createElement('td');
      const base = col * 15;
      const numero = base + fila + 1;
      td.textContent = numero;
      td.id = `cell-${numero}`;
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

function obtenerLetra(num) {
  if (num <= 15) return 'B';
  if (num <= 30) return 'I';
  if (num <= 45) return 'N';
  if (num <= 60) return 'G';
  return 'O';
}

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

btnComenzar.addEventListener('click', () => {
  socket.emit('comenzarPartida');

  // 🔁 Reiniciar estado local
  numerosDisponibles = Array.from({ length: 75 }, (_, i) => i + 1);
  historial = [];
  numeroSorteado.textContent = '--';
  actualizarListaUltimos();
  document.querySelectorAll('#tablaBingo td').forEach(td => td.classList.remove('resaltado'));

  // 🧼 Avisar a jugadores para limpiar también
  socket.emit('limpiarHistorial');
});

sortearBtn.addEventListener('click', () => {
  if (numerosDisponibles.length === 0) return alert("¡Fin del juego!");

  const index = Math.floor(Math.random() * numerosDisponibles.length);
  const num = numerosDisponibles.splice(index, 1)[0];
  const letra = obtenerLetra(num);
  const combinado = `${letra}${num}`;

  numeroSorteado.textContent = combinado;

  const celda = document.getElementById(`cell-${num}`);
  if (celda) celda.classList.add('resaltado');

  historial.unshift(combinado);
  if (historial.length > 5) historial.pop();
  actualizarListaUltimos();

  socket.emit('numeroSorteado', combinado);
});

limpiarBtn.addEventListener('click', () => {
  numerosDisponibles = Array.from({ length: 75 }, (_, i) => i + 1);
  historial = [];
  numeroSorteado.textContent = '--';
  actualizarListaUltimos();
  document.querySelectorAll('#tablaBingo td').forEach(td => td.classList.remove('resaltado'));
  socket.emit('limpiarHistorial');
});

socket.on('actualizarJugadores', (jugadores) => {
  listaJugadores.innerHTML = '';
  jugadores.forEach(nombre => {
    const li = document.createElement('li');
    li.textContent = nombre;
    listaJugadores.appendChild(li);
  });
});

window.addEventListener('DOMContentLoaded', generarTablaSorteo);
