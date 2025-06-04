const socket = io();

const btnUnirse = document.getElementById('unirseBtn');
const nombreInput = document.getElementById('nombreJugador');
const nombreMostrado = document.getElementById('nombreMostrado');
const tablaJugador = document.querySelector('#tablaJugador tbody');
const btnReiniciar = document.getElementById('reiniciarTablaBtn');

let nombreJugador = '';
let numerosAsignados = [];
let juegoTerminado = false;
let historial = [];

// Crear cartel de ganador sin botón de cerrar
const cartelGanador = document.createElement('div');
cartelGanador.id = 'cartelGanador';
cartelGanador.style.position = 'fixed';
cartelGanador.style.top = '50%';
cartelGanador.style.left = '50%';
cartelGanador.style.transform = 'translate(-50%, -50%)';
cartelGanador.style.padding = '20px 30px';
cartelGanador.style.backgroundColor = '#ffcc00';
cartelGanador.style.border = '3px solid #333';
cartelGanador.style.fontSize = '20px';
cartelGanador.style.borderRadius = '10px';
cartelGanador.style.zIndex = '1000';
cartelGanador.style.display = 'none';
cartelGanador.style.textAlign = 'center';

const cartelTexto = document.createElement('div');
cartelGanador.appendChild(cartelTexto);
document.body.appendChild(cartelGanador);

// Animación CSS para cartel
const style = document.createElement('style');
style.textContent = `
  @keyframes zoomIn {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
`;
document.head.appendChild(style);

// Crear contenedor de últimos números si no existe
let lista = document.getElementById('listaUltimos');
if (!lista) {
  const contenedor = document.createElement('div');
  contenedor.className = 'ultimos-numeros';
  const titulo = document.createElement('h3');
  titulo.textContent = 'Últimos números';
  lista = document.createElement('ul');
  lista.id = 'listaUltimos';
  contenedor.appendChild(titulo);
  contenedor.appendChild(lista);
  document.querySelector('.menu').appendChild(contenedor);
}

btnUnirse.addEventListener('click', registrarJugador);
nombreInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') registrarJugador();
});

function registrarJugador() {
  nombreJugador = nombreInput.value.trim();
  if (!nombreJugador) return alert("Por favor, escribe tu nombre.");
  nombreMostrado.textContent = `Bienvenido, ${nombreJugador}`;
  nombreInput.disabled = true;
  btnUnirse.disabled = true;
  socket.emit('jugadorNuevo', nombreJugador);
  generarCartillaAleatoria();
}

btnReiniciar.addEventListener('click', () => {
  const confirmar = confirm('¿Quieres mantener la misma cartilla o generar una nueva?\n\nAceptar = misma cartilla\nCancelar = nueva cartilla');
  document.querySelectorAll('#tablaJugador td').forEach(td => td.classList.remove('resaltado'));
  cartelGanador.style.display = 'none';
  if (!confirmar) {
    generarCartillaAleatoria();
  } else {
    remarcarFree();
  }
  juegoTerminado = false;
});


function generarCartillaAleatoria() {
  const columnas = {
    B: generarNumeros(1, 15),
    I: generarNumeros(16, 30),
    N: generarNumeros(31, 45),
    G: generarNumeros(46, 60),
    O: generarNumeros(61, 75)
  };

  if (!tablaJugador) {
    console.error('No se encontró el cuerpo de la tabla del jugador (#tablaJugador tbody).');
    return;
  }

  tablaJugador.innerHTML = '';
  numerosAsignados = [];

  for (let fila = 0; fila < 5; fila++) {
    const tr = document.createElement('tr');
    ['B', 'I', 'N', 'G', 'O'].forEach((col, colIndex) => {
      const td = document.createElement('td');

      if (col === 'N' && fila === 2) {
        td.textContent = 'Free';
        td.classList.add('resaltado');
        td.dataset.free = 'true';
      } else {
        const numero = columnas[col][fila >= 2 && col === 'N' ? fila - 1 : fila];
        td.textContent = numero;
        td.dataset.num = numero;
        td.addEventListener('click', () => {
          if (juegoTerminado) return;
          td.classList.toggle('resaltado');
          verificarGanador();
        });
        numerosAsignados.push(numero);
      }
      tr.appendChild(td);
    });
    tablaJugador.appendChild(tr);
  }
}

function generarNumeros(min, max) {
  const numeros = [];
  while (numeros.length < 5) {
    const n = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!numeros.includes(n)) numeros.push(n);
  }
  return numeros;
}

function verificarGanador() {
  if (juegoTerminado) return;

  const marcados = document.querySelectorAll('#tablaJugador td.resaltado');
  if (marcados.length !== 25) return;

  let todosValidos = true;
  let celdasInvalidas = [];

  marcados.forEach(td => {
    const n = td.dataset.num;
   if (n && !historial.some(h => parseInt(h.replace(/[^\d]/g, '')) === parseInt(n)))
 {
      td.style.backgroundColor = 'yellow'; // marcar inválido
      celdasInvalidas.push(td);
      todosValidos = false;
    } else {
      td.style.backgroundColor = ''; // válido
    }
  });

  if (todosValidos) {
    juegoTerminado = true;
    socket.emit('ganador', nombreJugador);
  } else {
    // Quitar fondo amarillo tras 1.5 segundos
    setTimeout(() => {
      celdasInvalidas.forEach(td => {
        td.style.backgroundColor = '';
      });
    }, 1500);

    alert("❌ No puedes ganar todavía. Algunos números marcados no han sido sorteados.");
  }
}

function remarcarFree() {
  const filas = tablaJugador.querySelectorAll('tr');
  if (filas[2]) {
    const tdCentro = filas[2].children[2];
    if (tdCentro.textContent === 'Free') {
      tdCentro.classList.add('resaltado');
    }
  }
}

socket.on('anunciarGanador', (nombre) => {
  juegoTerminado = true;
  cartelTexto.textContent = `🏆 ¡${nombre} ha ganado el bingo!`;
  cartelGanador.style.display = 'block';
  cartelGanador.style.animation = 'zoomIn 0.5s ease';

  // Reproducir sonido
  const audio = new Audio('https://www.myinstants.com/media/sounds/tada-fanfare.mp3');
  audio.play().catch(() => {});
});

socket.on('numeroSorteado', (numero) => {
  if (!historial.includes(numero)) {
    historial.unshift(numero);
    if (historial.length > 5) historial.pop();
    actualizarListaUltimos();
  }
});

socket.on('limpiarHistorial', () => {
  historial = [];
  actualizarListaUltimos();
});

function actualizarListaUltimos() {
  const lista = document.getElementById('listaUltimos');
  if (!lista) return;
  lista.innerHTML = '';
  historial.forEach((n, i) => {
    const li = document.createElement('li');
    li.textContent = n;
    li.style.display = 'block';
    if (i === 0) li.classList.add('ultimo-numero');
    lista.appendChild(li);
  });
}
