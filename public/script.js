const grid = document.querySelector('#grid-videojuegos');
const estadoCarga = document.querySelector('#estado-carga');
const estadoError = document.querySelector('#estado-error');
const filtroOrden = document.getElementById('filtro-orden');
const btnTodas = document.getElementById('btn-todas');
const botonesTienda = document.querySelectorAll('button[data-tienda]');
const modal = document.getElementById('modal-detalle');
const cerrarModal = document.getElementById('cerrar-modal');
const modalTitulo = document.getElementById('modal-titulo');
const modalImg = document.getElementById('modal-img');
const modalPrecio = document.getElementById('modal-precio');
const modalDescuento = document.getElementById('modal-descuento');
const modalPorcentaje = document.getElementById('modal-porcentaje');
const modalTienda = document.getElementById('modal-tienda');
const modalLink = document.getElementById('modal-link');
const modalCargando = document.getElementById('modal-cargando');
const modalContenido = document.getElementById('modal-contenido');
const inputBusqueda = document.querySelector('input[type="text"]');
const btnBusqueda = document.querySelector('.flex.items-center.gap-2 button')


let juegosOriginales = [];


function renderizarvideojuegos(lista) {
    grid.innerHTML = '';

    lista.forEach(juego => {
        const titulo = juego.title || 'Error de titulo';
        const img = juego.thumb || 'Error de imagen';
        const precio = juego.normalPrice ?? "-";
        const oferta = juego.salePrice ?? juego.cheapest ?? "-";
        const tienda = juego.storeID || 'Error de tienda';

        const card = document.createElement('article');
        card.className = "bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 flex flex-col";
        card.innerHTML = `
            <img src="${img}" alt="${titulo}" class="h-40 w-full object-cover" />
            <div class="p-4 flex flex-col gap-2 flex-1">
                <h3 class="font-semibold text-slate-900 leading-tight">${titulo}</h3>
               
                <p class="text-xs text-slate-500">
                    Precio: ${precio !== "-" ? `<s>$${precio}</s>` : "—"}
                    ${oferta !== "-" ? ` · <span class="font-semibold text-slate-900">$${oferta}</span>` : ""}
                </p>
                <button class="mt-2 w-full bg-slate-900 text-white py-2 rounded-lg text-sm hover:bg-slate-800 active:scale-95 active:bg-gray-900 shadow-md">
                    Ver detalle
                </button>
            </div> `;

      
        const btnDetalle = card.querySelector('button');
        btnDetalle.addEventListener('click', () => abrirModal(juego));

        grid.appendChild(card);
    });
}



function filtrarYOrdenar(tiendaID = null, query = '') {
    let resultado = [...juegosOriginales];

  
    if (query.trim() !== '') {
        const busquedaNormalizada = query.toLowerCase().trim();
        resultado = resultado.filter(juego => 
            juego.title && juego.title.toLowerCase().includes(busquedaNormalizada)
        );
    }

   
    if (tiendaID !== null) {
        resultado = resultado.filter(j => String(j.storeID) === String(tiendaID));
    }

  
    const orden = filtroOrden?.value;
    switch (orden) {
        case 'name':
            resultado.sort((a, b) => a.title.localeCompare(b.title));
            break;
            
        case 'recent':
            resultado.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
            break;
        
        case 'precio': 
        resultado.sort((a, b) => {
            const precioA = a.salePrice ?? a.normalPrice ?? Infinity;
            const precioB = b.salePrice ?? b.normalPrice ?? Infinity;
            return precioA - precioB;});
            break;

        case 'oferta':
            resultado.sort((a, b) => {
                const tieneDescA = a.salePrice && a.salePrice < a.normalPrice ? 1 : 0;
                const tieneDescB = b.salePrice && b.salePrice < b.normalPrice ? 1 : 0;
                return tieneDescB - tieneDescA;
            });
            break;
        default:
            break; 
    }

    renderizarvideojuegos(resultado);
}


async function cargarvideojuegos() {
    try {
        estadoCarga?.classList.remove('hidden');

        const url = 'https://www.cheapshark.com/api/1.0/deals?upperPrice=15&pageSize=20';
        const respuesta = await fetch(url);

        if (!respuesta.ok) throw new Error(`Error HTTP ${respuesta.status}: ${respuesta.statusText}`);

        juegosOriginales = await respuesta.json();
        filtrarYOrdenar(); 
        estadoCarga?.classList.add('hidden');
        estadoError?.classList.add('hidden');
    } catch (error) {
        console.error('Error al cargar videojuegos:', error);
        estadoCarga?.classList.add('hidden');
        estadoError?.classList.remove('hidden');
    }
}


function abrirModal(juego) {
    const tiendas = {
        7: 'GOG',
        11: 'Humble Store',
        13: 'Ubisoft',
        25: 'Epic Games Store'
    };

   
    modal.classList.remove('hidden');
    modalContenido.classList.add('hidden');
    modalCargando.classList.remove('hidden');


    setTimeout(() => {
  
        modalCargando.classList.add('hidden');
        modalContenido.classList.remove('hidden');

    
        modalTitulo.textContent = juego.title || 'Sin título';
        modalImg.src = juego.thumb || '';
        modalImg.alt = juego.title || '';
        modalPrecio.textContent = `Precio normal: $${juego.normalPrice ?? '-'}`;
        modalDescuento.textContent = juego.salePrice ? `Precio oferta: $${juego.salePrice}` : 'Sin descuento';

        if (juego.salePrice && juego.normalPrice) {
            const porcentaje = Math.round(((juego.normalPrice - juego.salePrice) / juego.normalPrice) * 100);
            modalPorcentaje.textContent = `Descuento: ${porcentaje}%`;
            modalLink.classList.remove('hidden');
            modalLink.href = `https://www.cheapshark.com/redirect?dealID=${juego.dealID}`;
        } else {
            modalPorcentaje.textContent = '';
            modalLink.classList.add('hidden');
        }

        modalTienda.textContent = `Tienda: ${tiendas[juego.storeID] || juego.storeID}`;
    }, 2000); 
}


cerrarModal.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.add('hidden');
});




botonesTienda.forEach(btn => {
    btn.addEventListener('click', () => {
        const tiendaID = btn.getAttribute('data-tienda');
        const query = inputBusqueda.value; 
        filtrarYOrdenar(tiendaID, query); 
    });
});


btnTodas.addEventListener('click', () => {
    const query = inputBusqueda.value;
    filtrarYOrdenar(null, query);
});


filtroOrden?.addEventListener('change', () => filtrarYOrdenar());

function ejecutarBusqueda() {
    const query = inputBusqueda.value;
    filtrarYOrdenar(null, query);
}


btnBusqueda.addEventListener('click', ejecutarBusqueda);


inputBusqueda.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        ejecutarBusqueda();
    }
});


cargarvideojuegos();