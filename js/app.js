// ============================================
// DATOS
// ============================================

const DATA = {
    modelos: {
        Chevrolet: ['NHR', 'NPR', 'NQR', 'NKR'],
        JAC: ['JRR', 'JHR Power', 'JHR Power+'],
        Foton: ['FHR', 'FQR', 'FRR', 'Aumark', 'Ollin'],
        JMC: ['CHR', 'CKR', 'CQR']
    },
    
    repuestos: [
        { id: 'bomper', nombre: 'Bómper Delantero', img: 'img/repuestos/bomper.png', categoria: 'Carrocería' },
        { id: 'farolas', nombre: 'Farolas', img: 'img/repuestos/farola.png', categoria: 'Eléctrico' },
        { id: 'exploradoras', nombre: 'Exploradoras', img: 'img/repuestos/exploradoras.png', categoria: 'Eléctrico' },
        { id: 'espejos', nombre: 'Espejos Retrovisores', img: 'img/repuestos/espejos.png', categoria: 'Accesorios' },
        { id: 'estribos', nombre: 'Estribos', img: 'img/repuestos/estribos.png', categoria: 'Accesorios' },
        { id: 'guardabarros', nombre: 'Guardabarros', img: 'img/repuestos/guardabarros.png', categoria: 'Carrocería' },
        { id: 'cromos', nombre: 'Cromos Decorativos', img: 'img/repuestos/cromos.png', categoria: 'Estética' },
        { id: 'manijas', nombre: 'Manijas de Puerta', img: 'img/repuestos/manijas.png', categoria: 'Carrocería' },
        { id: 'accesorios', nombre: 'Kit de Accesorios', img: 'img/repuestos/accesorios.png', categoria: 'General' }
    ]
};

// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================

const state = {
    marca: '',
    modelo: '',
    anio: '',
    repuestosSeleccionados: [],
    
    reset() {
        this.marca = '';
        this.modelo = '';
        this.anio = '';
        this.repuestosSeleccionados = [];
    }
};

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    inicializarAnios();
    configurarHistorial();
});

function inicializarAnios() {
    const select = document.getElementById('anioSelect');
    const anioActual = new Date().getFullYear();
    
    for (let i = anioActual; i >= 1990; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        select.appendChild(option);
    }
}

function configurarHistorial() {
    history.replaceState({ pantalla: 'inicio' }, '', location.pathname);
    
    window.addEventListener('popstate', (e) => {
        if (!e.state || e.state.pantalla === 'inicio') {
            mostrarPantalla('inicio');
        }
    });
}

// ============================================
// NAVEGACIÓN
// ============================================

function scrollToMarcas() {
    document.getElementById('marcas').scrollIntoView({ behavior: 'smooth' });
}

function seleccionarMarca(marca) {
    mostrarAnimacionCamion(marca);
}

function volverAMarcas() {
    history.pushState({ pantalla: 'inicio' }, '', '');
    mostrarPantalla('inicio');
    state.reset();
}

function volverInicio() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (state.marca) {
        volverAMarcas();
    }
}

function mostrarPantalla(pantalla) {
    const marcasSection = document.getElementById('marcas');
    const configurador = document.getElementById('configurador');
    
    if (pantalla === 'configurador') {
        marcasSection.style.display = 'none';
        configurador.style.display = 'block';
        configurador.classList.add('fade-in');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        configurador.style.display = 'none';
        marcasSection.style.display = 'block';
        marcasSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function cargarModelos(marca) {
    const select = document.getElementById('modeloSelect');
    select.innerHTML = '<option value="">Selecciona el modelo</option>';
    
    DATA.modelos[marca].forEach(modelo => {
        const option = document.createElement('option');
        option.value = modelo;
        option.textContent = modelo;
        select.appendChild(option);
    });
    
    select.addEventListener('change', (e) => {
        state.modelo = e.target.value;
    });
    
    document.getElementById('anioSelect').addEventListener('change', (e) => {
        state.anio = e.target.value;
    });
}

// ============================================
// SONIDO DEL MOTOR - GENERADO CON WEB AUDIO API
// ============================================

let audioContext = null;
let motorNodes = [];

function iniciarSonidoMotor() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        
        // OSCILADOR 1: Motor base diesel (grave)
        const osc1 = audioContext.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(65, now);
        
        const lfo1 = audioContext.createOscillator();
        lfo1.type = 'sine';
        lfo1.frequency.setValueAtTime(12, now);
        
        const lfoGain1 = audioContext.createGain();
        lfoGain1.gain.setValueAtTime(8, now);
        
        lfo1.connect(lfoGain1);
        lfoGain1.connect(osc1.frequency);
        lfo1.start(now);
        
        // OSCILADOR 2: Armónico metálico
        const osc2 = audioContext.createOscillator();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(130, now);
        
        const lfo2 = audioContext.createOscillator();
        lfo2.type = 'sine';
        lfo2.frequency.setValueAtTime(8, now);
        
        const lfoGain2 = audioContext.createGain();
        lfoGain2.gain.setValueAtTime(5, now);
        
        lfo2.connect(lfoGain2);
        lfoGain2.connect(osc2.frequency);
        lfo2.start(now);
        
        // RUIDO: Aire del motor
        const bufferSize = audioContext.sampleRate * 2;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = audioContext.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        
        const noiseFilter = audioContext.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(300, now);
        noiseFilter.Q.setValueAtTime(0.5, now);
        
        // GANANCIAS
        const gain1 = audioContext.createGain();
        gain1.gain.setValueAtTime(0.12, now);
        
        const gain2 = audioContext.createGain();
        gain2.gain.setValueAtTime(0.04, now);
        
        const gainNoise = audioContext.createGain();
        gainNoise.gain.setValueAtTime(0.03, now);
        
        // FILTRO PRINCIPAL
        const masterFilter = audioContext.createBiquadFilter();
        masterFilter.type = 'lowpass';
        masterFilter.frequency.setValueAtTime(600, now);
        masterFilter.frequency.linearRampToValueAtTime(400, now + 2);
        
        // MASTER GAIN con fade in/out
        const masterGain = audioContext.createGain();
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(1, now + 0.3);
        masterGain.gain.setValueAtTime(1, now + 1.8);
        masterGain.gain.linearRampToValueAtTime(0, now + 2.5);
        
        // CONEXIONES
        osc1.connect(gain1);
        osc2.connect(gain2);
        noise.connect(noiseFilter);
        noiseFilter.connect(gainNoise);
        
        gain1.connect(masterFilter);
        gain2.connect(masterFilter);
        gainNoise.connect(masterFilter);
        
        masterFilter.connect(masterGain);
        masterGain.connect(audioContext.destination);
        
        // INICIAR
        osc1.start(now);
        osc2.start(now);
        noise.start(now);
        
        motorNodes = [osc1, osc2, noise, lfo1, lfo2];
        
        setTimeout(() => {
            detenerSonidoMotor();
        }, 2600);
        
    } catch (e) {
        console.log('Audio no soportado:', e.message);
    }
}

function detenerSonidoMotor() {
    if (!audioContext || motorNodes.length === 0) return;
    
    const now = audioContext.currentTime;
    
    motorNodes.forEach(node => {
        try {
            if (node.stop) node.stop(now + 0.1);
        } catch (e) {}
    });
    
    setTimeout(() => {
        if (audioContext) {
            audioContext.close();
            audioContext = null;
            motorNodes = [];
        }
    }, 200);
}

// ============================================
// ANIMACIÓN DEL CAMIÓN
// ============================================

function mostrarAnimacionCamion(marca) {
    const overlay = document.getElementById('animacionCamion');
    const camion = document.getElementById('camionAnimado');

    const imagenes = {
        Chevrolet: 'img/animaciones/chevrolet.png',
        JAC: 'img/animaciones/jac.png',
        Foton: 'img/animaciones/foton.png',
        JMC: 'img/animaciones/jmc.png'
    };

    const rutaImagen = imagenes[marca] || 'img/animaciones/camion-generico.jpg';
    camion.src = rutaImagen;
    
    iniciarSonidoMotor();
    
    overlay.classList.add('activo');
    
    requestAnimationFrame(() => {
        overlay.classList.add('animar');
    });
    
    setTimeout(() => {
        overlay.classList.remove('activo');
        overlay.classList.remove('animar');
        cargarConfigurador(marca);
    }, 2500);
}

function cargarConfigurador(marca) {
    state.marca = marca;
    state.repuestosSeleccionados = [];
    
    history.pushState(
        { pantalla: 'configurador' },
        '',
        `#${marca.toLowerCase()}`
    );
    
    document.getElementById('marcaDisplay').textContent = marca;
    document.getElementById('breadcrumbText').textContent = marca;
    
    cargarModelos(marca);
    renderizarRepuestos();
    actualizarResumen();
    
    mostrarPantalla('configurador');
    mostrarNotificacion(`Has seleccionado ${marca}`, 'success');
}

// ============================================
// REPUESTOS
// ============================================

function renderizarRepuestos() {
    const container = document.getElementById('repuestosContainer');
    container.innerHTML = '';
    
    DATA.repuestos.forEach(repuesto => {
        const estaSeleccionado = state.repuestosSeleccionados.includes(repuesto.id);
        const elemento = crearElementoRepuesto(repuesto, estaSeleccionado);
        container.appendChild(elemento);
    });
}

function crearElementoRepuesto(repuesto, seleccionado) {
    const div = document.createElement('div');
    div.className = `repuesto-item ${seleccionado ? 'seleccionado' : ''}`;
    div.dataset.id = repuesto.id;
    
    div.innerHTML = `
        <div class="repuesto-imagen">
            <img src="${repuesto.img}" 
                 alt="${repuesto.nombre}" 
                 loading="lazy"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect width=%22100%22 height=%22100%22 fill=%22%23f1f5f9%22/%3E%3Ctext x=%2250%22 y=%2250%22 font-family=%22Arial%22 font-size=%2212%22 fill=%22%2364748b%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${repuesto.nombre}%3C/text%3E%3C/svg%3E'">
            <span class="check-icon">✓</span>
        </div>
        <div class="repuesto-info">
            <h4>${repuesto.nombre}</h4>
            <button class="btn-toggle" onclick="toggleRepuesto('${repuesto.id}')">
                ${seleccionado ? '✓ Agregado' : '+ Agregar'}
            </button>
        </div>
    `;
    
    div.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            toggleRepuesto(repuesto.id);
        }
    });
    
    return div;
}

function toggleRepuesto(id) {
    const index = state.repuestosSeleccionados.indexOf(id);
    const repuesto = DATA.repuestos.find(r => r.id === id);
    
    if (index > -1) {
        state.repuestosSeleccionados.splice(index, 1);
        mostrarNotificacion(`${repuesto.nombre} eliminado`, 'error');
    } else {
        state.repuestosSeleccionados.push(id);
        mostrarNotificacion(`${repuesto.nombre} agregado`, 'success');
    }
    
    renderizarRepuestos();
    actualizarResumen();
}

// ============================================
// RESUMEN Y COTIZACIÓN
// ============================================

function actualizarResumen() {
    const lista = document.getElementById('listaResumen');
    const contador = document.getElementById('contadorItems');
    
    if (state.repuestosSeleccionados.length === 0) {
        lista.innerHTML = '<p class="empty-state">Selecciona los repuestos que necesitas arriba...</p>';
        contador.textContent = '0 items';
        return;
    }
    
    lista.innerHTML = '';
    state.repuestosSeleccionados.forEach(id => {
        const repuesto = DATA.repuestos.find(r => r.id === id);
        const item = document.createElement('div');
        item.className = 'resumen-item';
        item.innerHTML = `
            <span>${repuesto.nombre}</span>
            <button class="btn-remove" onclick="toggleRepuesto('${id}')" aria-label="Eliminar ${repuesto.nombre}">×</button>
        `;
        lista.appendChild(item);
    });
    
    const cantidad = state.repuestosSeleccionados.length;
    contador.textContent = `${cantidad} item${cantidad !== 1 ? 's' : ''}`;
}

function enviarCotizacion() {
    if (!state.modelo) {
        mostrarNotificacion('Por favor selecciona el modelo', 'error');
        document.getElementById('modeloSelect').focus();
        return;
    }
    
    if (!state.anio) {
        mostrarNotificacion('Por favor selecciona el año', 'error');
        document.getElementById('anioSelect').focus();
        return;
    }
    
    if (state.repuestosSeleccionados.length === 0) {
        mostrarNotificacion('Selecciona al menos un repuesto', 'error');
        return;
    }
    
    const nombresRepuestos = state.repuestosSeleccionados.map(id => {
        return DATA.repuestos.find(r => r.id === id).nombre;
    });
    
    const mensaje = `¡Hola! Me interesa cotizar los siguientes repuestos:

🚛 *Marca:* ${state.marca}
🔧 *Modelo:* ${state.modelo}
📅 *Año:* ${state.anio}

📋 *Repuestos solicitados:*
${nombresRepuestos.map(r => '• ' + r).join('\n')}

Por favor envíenme precios y disponibilidad. ¡Gracias!`;
    
    const btn = document.getElementById('btnEnviar');
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = '<span class="loading">⏳</span> Enviando...';
    btn.disabled = true;
    
    setTimeout(() => {
        window.open(`https://wa.me/573124692806?text=${encodeURIComponent(mensaje)}`, '_blank');
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
    }, 600);
}

// ============================================
// NOTIFICACIONES
// ============================================

function mostrarNotificacion(texto, tipo = 'success') {
    const notif = document.getElementById('notificacion');
    const icon = document.getElementById('notifIcon');
    const text = document.getElementById('notifText');
    
    text.textContent = texto;
    icon.textContent = tipo === 'success' ? '✓' : '⚠';
    
    notif.className = `notificacion ${tipo} mostrar`;
    
    setTimeout(() => {
        notif.classList.remove('mostrar');
    }, 3000);
}

// ============================================
// UTILIDADES
// ============================================

document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        this.style.opacity = '0.5';
        this.parentElement.classList.add('imagen-error');
    });
});

const trackEvent = (accion, categoria, etiqueta) => {
    if (window.gtag) {
        gtag('event', accion, {
            event_category: categoria,
            event_label: etiqueta
        });
    }
    console.log(`[Analytics] ${accion}: ${etiqueta}`);
};

// Exponer funciones globalmente
window.seleccionarMarca = seleccionarMarca;
window.volverAMarcas = volverAMarcas;
window.volverInicio = volverInicio;
window.toggleRepuesto = toggleRepuesto;
window.enviarCotizacion = enviarCotizacion;
window.scrollToMarcas = scrollToMarcas;