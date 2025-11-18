const grid = document.querySelector('#grid-videojuegos');
const estadoCarga = document.querySelector('#estado-carga');
const estadoError = document.querySelector('#estado-error');
const filtroTienda = document.getElementById('filtro-tienda');
const filtroOrden = document.getElementById('filtro-orden');
const btnSteam = document.getElementById('btn-steam');
const btnEpic = document.getElementById('btn-epic');
const btnGog = document.getElementById('btn-gog');
const btnMS = document.getElementById('btn-ms');
const btnTodas = document.getElementById('btn-todas');

let juegosOriginales = [];

if (!grid || !estadoCarga || !estadoError) {
    console.error('Faltan elementos HTML requeridos: #grid-videojuegos, #estado-carga, #estado-error');
}




function renderizarvideojuegos(lista) {
    grid.innerHTML = '';

    lista.forEach((juego) => {

        const titulo = juego.title || 'Error de titulo';
        const img = juego.thumb || 'Error de imagen';
        const precio = juego.normalPrice ?? "-" ;
        const oferta = juego.salePrice ?? juego.cheapest ?? "-";
        const tienda = juego.storeID || 'Error de tienda';

        const card = document.createElement('article');
        card.className = "bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 flex flex-col";
        card.innerHTML = `
        <img src="${img}" alt="${titulo}" class="h-40 w-full object-cover" />
        <div class="p-4 flex flex-col gap-2 flex-1">
        <h3 class="font-semibold text-slate-900 leading-tight">${titulo}</h3>
        <p class="text-xs text-slate-400">${tienda}</p>
        <p class="text-xs text-slate-500">
            Precio: ${precio && precio !== "-" ? `<s>$${precio}</s>` : "—"}
            ${oferta && oferta !== "-" ? ` · <span class="font-semibold text-slate-900">$${oferta}</span>` : ""}
        </p>
        <button class="mt-2 w-full bg-slate-900 text-white py-2 rounded-lg text-sm hover:bg-slate-800">
                Ver detalle
        </button>
        </div>
            `;
        grid.appendChild(card);
    });

}


async function cargarvideojuegos() {
    try {
        if (estadoCarga) estadoCarga.classList.remove('hidden');
        
        const url = 'https://www.cheapshark.com/api/1.0/deals?upperPrice=15&pageSize=20';
        const respuesta = await fetch(url);
        
        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status}: ${respuesta.statusText}`);
        }
        
        const datos = await respuesta.json();
        juegosOriginales = datos;
        window._videojuegos = datos;
        renderizarvideojuegos(datos);
        cargarOpcionesTiendas(datos);
        
        if (estadoCarga) estadoCarga.classList.add('hidden');
        if (estadoError) estadoError.classList.add('hidden');
    } catch (error) {
        console.error('Error al cargar los videojuegos:', error);
        if (estadoCarga) estadoCarga.classList.add('hidden');
        if (estadoError) estadoError.classList.remove('hidden');
    }
}
cargarvideojuegos();

function cargarOpcionesTiendas(juegos) {
  if (!filtroTienda) return; 
  
  const storesUnicos = [...new Set(juegos.map(j => j.storeID))];
  filtroTienda.querySelectorAll('option:not([value=""])').forEach(o => o.remove());

  const tiendas = {
    7: 'Epic Games Store',
    11: 'GOG',
    13: 'Microsoft Store',
    25: 'Steam'
  };

  storesUnicos.forEach(storeID => {
    const option = document.createElement('option');
    option.value = storeID;
    option.textContent = tiendas[storeID] || `Tienda ${storeID}`;
    filtroTienda.appendChild(option);
  });
}


// Función para aplicar todos los filtros
function aplicarFiltros() {
  let resultado = [...juegosOriginales];

  // Filtro por tienda
  const tiendaSeleccionada = filtroTienda?.value;
  if (tiendaSeleccionada) {
    resultado = resultado.filter(j => j.storeID == tiendaSeleccionada);
  }

  // Ordenar resultados
  const ordenSeleccionado = filtroOrden?.value;
  switch (ordenSeleccionado) {
    case 'name':
      resultado.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'recent':
      resultado.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
      break;
    case 'rating':
    default:
      resultado.sort((a, b) => {
        const descA = a.salePrice ? ((a.normalprice - a.salePrice) / a.normalprice) * 100 : 0;
        const descB = b.salePrice ? ((b.normalprice - b.salePrice) / b.normalprice) * 100 : 0;
        return descB - descA;
      });
  }

  renderizarvideojuegos(resultado);
}

// Función para filtrar por tienda desde botones
function filtrarPorTiendaBoton(tiendaID) {
  if (tiendaID === null) {
    // Ver todas las tiendas
    filtroTienda.value = '';
  } else {
    filtroTienda.value = tiendaID;
  }
  aplicarFiltros();
}

// Listeners para filtros del select
if (filtroTienda) {
  filtroTienda.addEventListener('change', aplicarFiltros);
}

if (filtroOrden) {
  filtroOrden.addEventListener('change', aplicarFiltros);
}

// Listeners para botones de tiendas
if (btnSteam) btnSteam.addEventListener('click', () => filtrarPorTiendaBoton(25));
if (btnEpic) btnEpic.addEventListener('click', () => filtrarPorTiendaBoton(7));
if (btnGog) btnGog.addEventListener('click', () => filtrarPorTiendaBoton(11));
if (btnTodas) btnTodas.addEventListener('click', () => filtrarPorTiendaBoton(null));

cargarvideojuegos();