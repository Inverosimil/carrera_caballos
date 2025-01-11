// ===============================
//  REFERENCIAS A ELEMENTOS HTML
// ===============================
const tabla = document.getElementById('tabla-participantes').querySelector('tbody');
const btnAgregarParticipante = document.getElementById('btn-agregar-participante');
const btnReiniciar = document.getElementById('btn-reiniciar');
const seleccionGanador = document.getElementById('seleccion-ganador');
const resultadosGanadores = document.getElementById('resultados-ganadores');
const btnFinalizarRonda = document.getElementById('btn-finalizar-ronda');
const historialContenido = document.getElementById('historial-contenido');

const btnVerHistorial = document.getElementById('btn-ver-historial');
const btnVerEstadisticas = document.getElementById('btn-ver-estadisticas');
const seccionHistorial = document.getElementById('historial');
const seccionEstadisticas = document.getElementById('estadisticas');
const estadisticasContenido = document.getElementById('estadisticas-contenido');

// ===============================
//  VARIABLES GLOBALES
// ===============================
let participantes = []; 
// { "nombre": [apuestaOro, apuestaEspada, apuestaBasto, apuestaCopa] }
let apuestas = {};  
let ganadorSeleccionado = false;

// Array de rondas jugadas, la más reciente va primero
let rondas = [];

// Estructura para estadísticas globales
let estadisticas = {
  caballosGanados: {
    'Oro': 0,
    'Espada': 0,
    'Basto': 0,
    'Copa': 0
  },
  jugadores: {}
};

// ===============================
//  EVENTOS PRINCIPALES
// ===============================

// Agregar participante
btnAgregarParticipante.addEventListener('click', () => {
  const nombre = prompt('Ingrese el nombre:');
  if (nombre) {
    participantes.push(nombre);
    apuestas[nombre] = [0, 0, 0, 0]; // Oro, Espada, Basto, Copa

    if (!estadisticas.jugadores[nombre]) {
      estadisticas.jugadores[nombre] = {
        totalApuestas: 0,
        totalGanado: 0,
        totalPerdido: 0
      };
    }
    actualizarTabla();

    if (participantes.length > 0) {
      seleccionGanador.style.display = 'block';
    }
  }
});

// Reiniciar apuestas (mantiene jugadores)
btnReiniciar.addEventListener('click', () => {
  for (let nombre of participantes) {
    apuestas[nombre] = [0, 0, 0, 0];
  }
  actualizarTabla();
  resultadosGanadores.innerHTML = '';
  btnFinalizarRonda.style.display = 'none';
  ganadorSeleccionado = false;
});

// Mostrar Historial
btnVerHistorial.addEventListener('click', () => {
  seccionHistorial.style.display = 'block';
  seccionEstadisticas.style.display = 'none';
});

// Mostrar Estadísticas
btnVerEstadisticas.addEventListener('click', () => {
  seccionHistorial.style.display = 'none';
  seccionEstadisticas.style.display = 'block';
  renderEstadisticas();
});

// ===============================
//  FUNCIONES
// ===============================
function actualizarTabla() {
  tabla.innerHTML = '';

  participantes.forEach((participante, index) => {
    const fila = document.createElement('tr');
    // Celda para el nombre y su botón de eliminar
    const celdaNombre = `
      ${participante}
      <button class="eliminar-btn" onclick="eliminarParticipante(${index})">X</button>
    `;

    // Oro (0), Espada (1), Basto (2), Copa (3)
    fila.innerHTML = `
      <td>${celdaNombre}</td>
      ${[0,1,2,3].map((i) => `
        <td>
          <div class="apuesta-input">
            <input
              type="number"
              id="apuesta-${participante}-${i}"
              value="${apuestas[participante][i]}"
              min="0"
              step="50"
              oninput="actualizarApuesta('${participante}', ${i})"
            />
            <button
              class="apuesta-btn"
              onclick="cambiarMonto('${participante}', ${i}, 50)"
            >▲</button>
            <button
              class="apuesta-btn"
              onclick="cambiarMonto('${participante}', ${i}, -50)"
            >▼</button>
          </div>
        </td>
      `).join('')}
    `;
    tabla.appendChild(fila);
  });
}

// Eliminar participante
function eliminarParticipante(index) {
  const nombreEliminado = participantes[index];
  participantes.splice(index, 1);
  delete apuestas[nombreEliminado];

  actualizarTabla();
  if (participantes.length === 0) {
    seleccionGanador.style.display = 'none';
  }
}

// Actualizar apuesta (input manual)
function actualizarApuesta(participante, indice) {
  const input = document.getElementById(`apuesta-${participante}-${indice}`);
  const valor = parseFloat(input.value);
  apuestas[participante][indice] = isNaN(valor) ? 0 : valor;
}

// Cambiar monto con flechas
function cambiarMonto(participante, indice, cantidad) {
  const input = document.getElementById(`apuesta-${participante}-${indice}`);
  let valorActual = parseFloat(input.value);
  if (isNaN(valorActual)) valorActual = 0;

  valorActual += cantidad;
  if (valorActual < 0) valorActual = 0;

  input.value = valorActual;
  apuestas[participante][indice] = valorActual;
}

// Seleccionar caballo ganador
function seleccionarGanador(caballoGanador) {
  resultadosGanadores.innerHTML = '';

  const indiceCaballo = { 'Oro': 0, 'Espada': 1, 'Basto': 2, 'Copa': 3 }[caballoGanador];

  let fondoTotal = 0;
  let fondoGanadores = 0;

  for (const nombre in apuestas) {
    const totalApostado = apuestas[nombre].reduce((a, b) => a + b, 0);
    fondoTotal += totalApostado;
    fondoGanadores += apuestas[nombre][indiceCaballo];
  }

  resultadosGanadores.innerHTML += `<p>El caballo ganador es <strong>${caballoGanador}</strong></p>`;

  if (fondoGanadores <= 0) {
    resultadosGanadores.innerHTML += `<p>Nadie apostó a ${caballoGanador}.</p>`;
  } else {
    for (const nombre in apuestas) {
      const montoApostado = apuestas[nombre][indiceCaballo];
      const totalApostadoJugador = apuestas[nombre].reduce((a, b) => a + b, 0);

      if (montoApostado > 0) {
        const montoGanado = (montoApostado / fondoGanadores) * fondoTotal;
        resultadosGanadores.innerHTML += `<p>${nombre} ganó $${montoGanado.toFixed(2)}</p>`;
      }
    }
  }

  btnFinalizarRonda.style.display = 'block';
  ganadorSeleccionado = true;
}

// Finalizar Ronda (actualiza estadísticas)
function finalizarRonda() {
  if (!ganadorSeleccionado) {
    alert('Primero debes seleccionar un caballo ganador.');
    return;
  }
  const textoResultados = resultadosGanadores.innerHTML;

  // Guardamos la ronda al principio del array
  rondas.unshift(`
    <div class="historial-item">
      ${textoResultados}
    </div>
  `);
  renderHistorial();

  // Buscar caballo ganador en el texto
  const match = textoResultados.match(/caballo ganador es <strong>(\w+)<\/strong>/);
  if (match && match[1]) {
    const caballoGanador = match[1];
    estadisticas.caballosGanados[caballoGanador]++;
    recalcularEstadisticas(caballoGanador);
  }

  // Limpiamos apuestas
  for (let nombre of participantes) {
    apuestas[nombre] = [0, 0, 0, 0];
  }
  actualizarTabla();

  btnFinalizarRonda.style.display = 'none';
  ganadorSeleccionado = false;
  resultadosGanadores.innerHTML = '';
}

// Render de historial
function renderHistorial() {
  historialContenido.innerHTML = rondas.join('');
}

// Recalcula estadísticas de todos los jugadores tras finalizar una ronda
function recalcularEstadisticas(caballoGanador) {
  const indiceCaballo = { 'Oro': 0, 'Espada': 1, 'Basto': 2, 'Copa': 3 }[caballoGanador];

  let fondoTotal = 0;
  let fondoGanadores = 0;

  // 1. Calculamos fondos
  for (const nombre in apuestas) {
    const totalApostado = apuestas[nombre].reduce((a, b) => a + b, 0);
    fondoTotal += totalApostado;
    fondoGanadores += apuestas[nombre][indiceCaballo];
  }

  // 2. Actualizamos stats de cada jugador
  for (const nombre of participantes) {
    const totalApostadoJugador = apuestas[nombre].reduce((a, b) => a + b, 0);
    estadisticas.jugadores[nombre].totalApuestas += totalApostadoJugador;

    const montoApostadoAlCaballo = apuestas[nombre][indiceCaballo];
    if (montoApostadoAlCaballo > 0 && fondoGanadores > 0) {
      const montoGanado = (montoApostadoAlCaballo / fondoGanadores) * fondoTotal;
      const gananciaNeta = montoGanado - totalApostadoJugador;
      if (gananciaNeta > 0) {
        estadisticas.jugadores[nombre].totalGanado += gananciaNeta;
      } else {
        estadisticas.jugadores[nombre].totalPerdido += Math.abs(gananciaNeta);
      }
    } else {
      // No apostó a este caballo, pierde todo
      if (totalApostadoJugador > 0 && montoApostadoAlCaballo === 0) {
        estadisticas.jugadores[nombre].totalPerdido += totalApostadoJugador;
      }
    }
  }
}

// Render de estadísticas
function renderEstadisticas() {
  const { caballosGanados, jugadores } = estadisticas;
  let html = `
    <div>
      <h4>Veces que ha ganado cada caballo:</h4>
      <ul>
        <li>Oro: ${caballosGanados['Oro']}</li>
        <li>Espada: ${caballosGanados['Espada']}</li>
        <li>Basto: ${caballosGanados['Basto']}</li>
        <li>Copa: ${caballosGanados['Copa']}</li>
      </ul>
    </div>
    <hr>
    <div>
      <h4>Jugadores</h4>
  `;

  for (const nombre in jugadores) {
    const { totalApuestas, totalGanado, totalPerdido } = jugadores[nombre];
    html += `
      <div style="margin-bottom:10px;">
        <strong>${nombre}</strong><br>
        Apuestas Totales: $${totalApuestas.toFixed(2)}<br>
        Ganancias Totales: $${totalGanado.toFixed(2)}<br>
        Pérdidas Totales: $${totalPerdido.toFixed(2)}
      </div>
    `;
  }

  html += '</div>';
  estadisticasContenido.innerHTML = html;
}
