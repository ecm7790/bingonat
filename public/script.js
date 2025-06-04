const tablaBody = document.querySelector('#tablaBingo tbody');
const btnLimpiar = document.getElementById('limpiarBtn');
const listaUltimos = document.getElementById('listaUltimos');
const btnSortear = document.getElementById('sortearBtn');
const numeroSorteadoDisplay = document.getElementById('numeroSorteado');

const columnas = ['B', 'I', 'N', 'G', 'O'];
const rangos = {
  B: [1, 15],
  I: [16, 30],
  N: [31, 45],
  G: [46, 60],
  O: [61, 75]
};

let historial = [];
let numerosDisponibles = Array.from({ length: 75 }, (_, i) => i + 1);

// Función para obtener la letra según el número
function obtenerLetra(num) {
  if (num >= 1 && num <= 15) return 'B';
  if (num >= 16 && num <= 30) return 'I';
  if (num >= 31 && num <= 45) return 'N';
  if (num >= 46 && num <= 60) return 'G';
  if (num >= 61 && num <= 75) return 'O';
  return '?';
}

// Crear la tabla de bingo
function crearTabla() {
  for (let fila = 0; fila < 15; fila++) {
    const tr = document.createElement('tr');
    columnas.forEach(col => {
      const [min, max] = rangos[col];
      const numero = min + fila;
      const td = document.createElement('td');
      td.textContent = numero <= max ? numero : '';
      td.id = `cell-${numero}`;

      td.addEventListener('click', () => {
        if (!td.textContent) return;
        const num = parseInt(td.textContent);

        if (td.classList.contains('resaltado')) {
          td.classList.remove('resaltado');

          const index = historial.indexOf(num);
          if (index !== -1) {
            historial.splice(index, 1);
            actualizarListaUltimos();
          }

          if (!numerosDisponibles.includes(num)) {
            numerosDisponibles.push(num);
            numerosDisponibles.sort((a, b) => a - b);
          }
        } else {
          if (!numerosDisponibles.includes(num)) return;

          td.classList.add('resaltado');
          historial.unshift(num);
          if (historial.length > 5) historial.pop();
          actualizarListaUltimos();

          const idx = numerosDisponibles.indexOf(num);
          if (idx !== -1) numerosDisponibles.splice(idx, 1);

          verificarFinDelJuego();
        }
      });

      tr.appendChild(td);
    });
    tablaBody.appendChild(tr);
  }
}

// Actualizar lista de últimos 5 números
function actualizarListaUltimos() {
  listaUltimos.innerHTML = '';
  historial.forEach((n, index) => {
    const li = document.createElement('li');
    const letra = obtenerLetra(n);
    li.textContent = `${letra}${n}`;
    if (index === 0) {
      li.classList.add('ultimo-numero');
    }
    listaUltimos.appendChild(li);
  });
}

// Limpiar y reiniciar el juego
function limpiarTodos() {
  if (confirm('¿Seguro que quieres borrar todos los números resaltados?')) {
    const resaltados = document.querySelectorAll('.resaltado');
    resaltados.forEach(celda => celda.classList.remove('resaltado'));
    historial = [];
    numerosDisponibles = Array.from({ length: 75 }, (_, i) => i + 1);
    numeroSorteadoDisplay.textContent = '--';
    actualizarListaUltimos();
    localStorage.removeItem('ganadorBingo'); // limpiar ganador
  }
}

// Sortear un número aleatorio no repetido
function sortearNumero() {
  if (numerosDisponibles.length === 0) {
    alert("🎉 ¡El juego ha terminado! Todos los números han sido usados.");
    return;
  }

  const indice = Math.floor(Math.random() * numerosDisponibles.length);
  const num = numerosDisponibles.splice(indice, 1)[0];
  const letra = obtenerLetra(num);
socket.emit('numeroSorteado', `${letra}${num}`);

  numeroSorteadoDisplay.textContent = `${letra}${num}`;

  const celda = document.getElementById(`cell-${num}`);
  if (celda && !celda.classList.contains('resaltado')) {
    celda.classList.add('resaltado');
    if (!historial.includes(num)) {
      historial.unshift(num);
      if (historial.length > 5) historial.pop();
      actualizarListaUltimos();
    }
  }

  verificarFinDelJuego();
}

// Verifica si ya no quedan números
function verificarFinDelJuego() {
  if (numerosDisponibles.length === 0) {
    setTimeout(() => {
      alert("🎉 ¡El juego ha terminado! Todos los números han sido usados.");
    }, 100);
  }
}


// Inicialización
btnLimpiar.addEventListener('click', limpiarTodos);
btnSortear.addEventListener('click', sortearNumero);
crearTabla();
const socket = io();

socket.on('anunciarGanador', (nombre) => {
  alert(`🏆 ¡${nombre} ha ganado el bingo!`);
});
