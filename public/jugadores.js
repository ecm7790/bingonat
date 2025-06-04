const socket = io();

const btnUnirse = document.getElementById('unirseBtn');
const nombreInput = document.getElementById('nombreJugador');
const nombreMostrado = document.getElementById('nombreMostrado');
const tablaJugador = document.querySelector('#tablaJugador tbody');
const btnReiniciar = document.getElementById('reiniciarTablaBtn');

let nombreJugador = '';
let numerosAsignados = [];
let juegoTerminado = false;

// Crear cartel de ganador con botón de cerrar
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
const btnCerrarCartel = document.createElement('button');
btnCerrarCartel.textContent = 'Cerrar';
btnCerrarCartel.style.marginTop = '10px';
btnCerrarCartel.style.padding = '5px 10px';
btnCerrarCartel.style.fontSize = '14px';
btnCerrarCartel.addEventListener('click', () => {
  cartelGanador.style.display = 'none';
});

cartelGanador.appendChild(cartelTexto);
cartelGanador.appendChild(btnCerrarCartel);
document.body.appendChild(cartelGanador);

btnUnirse.addEventListener('click', () => {
  nombreJugador = nombreInput.value.trim();
  if (!nombreJugador) return alert("Por favor, escribe tu nombre.");
  nombreMostrado.textContent = `Bienvenido, ${nombreJugador}`;
  nombreInput.disabled = true;
  btnUnirse.disabled = true;
  generarCartillaAleatoria();
});

btnReiniciar.addEventListener('click', () => {
  if (juegoTerminado) return;
  const confirmacion = confirm('¿Quieres mantener la misma cartilla o generar una nueva?\n\nAceptar = misma cartilla\nCancelar = nueva cartilla');
  document.querySelectorAll('#tablaJugador td').forEach(td => td.classList.remove('resaltado'));
  if (!confirmacion) {
    generarCartillaAleatoria();
  } else {
    remarcarFree();
  }
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
  const marcados = document.querySelectorAll('#tablaJugador td.resaltado');
  if (marcados.length === 25 && !juegoTerminado) {
    juegoTerminado = true;
    socket.emit('ganador', nombreJugador);
    setTimeout(() => {
      alert(`🎉 ${nombreJugador} ha ganado el bingo`);
      const continuar = confirm('¿Quieres seguir jugando con la misma cartilla?\nAceptar = Sí\nCancelar = Nueva cartilla');
      juegoTerminado = false;
      document.querySelectorAll('#tablaJugador td').forEach(td => td.classList.remove('resaltado'));
      if (!continuar) {
        generarCartillaAleatoria();
      } else {
        remarcarFree();
      }
      cartelGanador.style.display = 'none';
    }, 100);
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
});
