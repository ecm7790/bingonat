const socket = io();

const tablaBody = document.querySelector('#tablaBingo tbody');
const btnLimpiar = document.getElementById('limpiarBtn');
const listaUltimos = document.getElementById('listaUltimos');
const btnSortear = document.getElementById('sortearBtn');
const numeroSorteadoDisplay = document.getElementById('numeroSorteado');

const columnas = ['B', 'I', 'N', 'G', 'O'];
const rangos = { B: [1, 15], I: [16, 30], N: [31, 45], G: [46, 60], O: [61, 75] };

let historial = [];
let numerosDisponibles = Array.from({ length: 75 }, (_, i) => i + 1);

function obtenerLetra(num) {
  if (num >= 1 && num <= 15) return 'B';
  if (num >= 16 && num <= 30) return 'I';
  if (num >= 31 && num <= 45) return 'N';
  if (num >= 46 && num <= 60) return 'G';
  if (num >= 61 && num <= 75) return 'O';
}

function crearTabla() {
  tablaBody.innerHTML = ''; // Limpia la tabla antes de recrearla
  for (let fila = 0; fila < 15; fila++) {
    const tr = document.createElement('tr');
    columnas.forEach(col => {
      const [min, max] = rangos[col];
      const numero = min + fila;
      const td = document.createElement('td');
      if (numero <= max) {
        td.textContent = numero;
        td.id = `cell-${numero}`;
        td.addEventListener('click', () => {
          if (!td.textContent) return;
          const num = parseInt(td.textContent);
          if (td.classList.contains('resaltado')) {
            td.classList.remove('resaltado');
            historial = historial.filter(n => n !== num);
            numerosDisponibles.push(num);
            numerosDisponibles.sort((a, b) => a - b);
            actualizarListaUltimos();
          } else {
            if (!numerosDisponibles.includes(num)) return;
            td.classList.add('resaltado');
            historial.unshift(num);
            if (historial.length > 5) historial.pop();
            const idx = numerosDisponibles.indexOf(num);
            if (idx !== -1) numerosDisponibles.splice(idx, 1);
            actualizarListaUltimos();
          }
        });
      }
      tr.appendChild(td);
    });
    tablaBody.appendChild(tr);
  }
}

function actualizarListaUltimos() {
  listaUltimos.innerHTML = '';
  historial.forEach((n, i) => {
    const li = document.createElement('li');
    li.textContent = `${obtenerLetra(n)}${n}`;
    li.style.display = 'block';
    if (i === 0) li.classList.add('ultimo-numero');
    listaUltimos.appendChild(li);
  });
}

function limpiarTodos() {
  if (confirm('¿Seguro que quieres borrar todos los números resaltados?')) {
    document.querySelectorAll('.resaltado').forEach(td => td.classList.remove('resaltado'));
    historial = [];
    numerosDisponibles = Array.from({ length: 75 }, (_, i) => i + 1);
    numeroSorteadoDisplay.textContent = '--';
    actualizarListaUltimos();
    socket.emit('limpiarHistorial');
  }
}

function sortearNumero() {
  if (numerosDisponibles.length === 0) return alert("🎉 ¡Fin del juego!");
  const index = Math.floor(Math.random() * numerosDisponibles.length);
  const num = numerosDisponibles.splice(index, 1)[0];
  const letra = obtenerLetra(num);
  numeroSorteadoDisplay.textContent = `${letra}${num}`;
  const celda = document.getElementById(`cell-${num}`);
  if (celda) celda.classList.add('resaltado');
  historial.unshift(num);
  if (historial.length > 5) historial.pop();
  actualizarListaUltimos();
  socket.emit('numeroSorteado', `${letra}${num}`);
}

socket.on('anunciarGanador', (nombre) => {
  alert(`🏆 ¡${nombre} ha ganado el bingo!`);
});

socket.on('limpiarHistorial', () => {
  historial = [];
  actualizarListaUltimos();
});

btnLimpiar.addEventListener('click', limpiarTodos);
btnSortear.addEventListener('click', sortearNumero);
crearTabla();
