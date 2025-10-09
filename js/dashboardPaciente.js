// js/dashboardPaciente.js
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const content = document.getElementById("content");
  const navLinks = Array.from(document.querySelectorAll(".nav-item"));

  if (!sidebar || !sidebarToggle || !content) {
    console.error("Elementos esenciales no encontrados en DOM");
    return;
  }

  // ---------- ALMACENAMIENTO DE CITAS EN LOCAL STORAGE ---------- //
  const getCitas = () => {
    const citas = localStorage.getItem("citas");
    return citas ? JSON.parse(citas) : [];
  };

  const saveCitas = (citas) => {
    localStorage.setItem("citas", JSON.stringify(citas));
  };

  // ---------- DATOS DE PRUEBAS DE LABORATORIO ---------- //
  const getPruebas = () => {
    // Datos de ejemplo de pruebas de laboratorio
    return [
      {
        id: 1,
        nombre: "Análisis de Sangre",
        fecha: "15/06/2025",
        estado: "Disponible",
        pdfUrl:
          "https://drive.google.com/file/d/1VGrLH2ZgNZImHMEfAYNmb72hrXC7Lb2Z/preview",
      },
      {
        id: 2,
        nombre: "Perfil Lipídico",
        fecha: "10/06/2025",
        estado: "Disponible",
        pdfUrl: "https://drive.google.com/file/d/1v6c3DxpLpFGKQwPdzsIhYHk_FnV62036/preview",
      },
      {
        id: 3,
        nombre: "Hemograma Completo",
        fecha: "05/06/2025",
        estado: "Disponible",
        pdfUrl:
          "https://drive.google.com/file/d/1e4sTAn2G4CMt8aUm6BOXOHkGADf0OZW1/preview",
      },
      {
        id: 4,
        nombre: "Glucosa en Ayunas",
        fecha: "01/06/2025",
        estado: "Disponible",
        pdfUrl: "https://drive.google.com/file/d/1W_vDXiz91uINL2NyN3DJF6tmH7VwQPwo/preview",
      },
    ];
  };

  // ---------- FUNCIONES ---------- //
  const isMobile = () => window.innerWidth <= 768;

  const openSidebar = () => {
    if (isMobile()) sidebar.style.transform = "translateX(0)";
    else sidebar.classList.remove("collapsed");
  };

  const closeSidebar = () => {
    if (isMobile()) sidebar.style.transform = "translateX(-100%)";
    else sidebar.classList.add("collapsed");
  };

  const toggleSidebar = () => {
    if (isMobile()) {
      const current = getComputedStyle(sidebar).transform;
      if (current === "matrix(1, 0, 0, 1, 0, 0)" || current === "none") {
        closeSidebar();
      } else {
        openSidebar();
      }
    } else {
      sidebar.classList.toggle("collapsed");
    }
  };

  const loadSection = (section) => {
    fetch(`views/${section}.html`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((html) => {
        content.style.transition = "opacity 0.25s ease";
        content.style.opacity = 0;
        setTimeout(() => {
          content.innerHTML = html;
          content.style.opacity = 1;

          if (section === "citas") {
            initCitasView();
          } else if (section === "solicitar-cita") {
            initSolicitarCitaView();
          } else if (section === "resultados") {
            initResultadosView();
          } else if (section === "ver-resultado") {
            initVerResultadoView();
          }
        }, 180);
      })
      .catch((err) => {
        console.error("Error cargando vista", section, err);
        content.innerHTML = `<p style="color:crimson">Error al cargar la vista "${section}". Revisa la consola.</p>`;
      });
  };

  const initCitasView = () => {
    const btnAgendarCita = document.getElementById("btnAgendarCita");
    const citasList = document.getElementById("citasList");

    if (btnAgendarCita) {
      btnAgendarCita.addEventListener("click", () => {
        loadSection("solicitar-cita");
      });
    }

    // Cargar y mostrar las citas
    if (citasList) {
      renderCitas();
    }
  };

  const renderCitas = () => {
    const citasList = document.getElementById("citasList");
    const citas = getCitas();

    if (citas.length === 0) {
      citasList.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-calendar-xmark"></i>
          <p>No tienes citas programadas</p>
          <p class="muted">Agenda tu primera cita médica</p>
        </div>
      `;
      return;
    }

    citasList.innerHTML = citas
      .map(
        (cita, index) => `
      <div class="cita-card">
        <div class="cita-info">
          <div class="cita-date">${cita.fecha} — ${cita.horario}</div>
          <div class="cita-detail">
            <i class="fa-solid fa-stethoscope"></i> ${cita.especialidad}
          </div>
          <div class="cita-detail">
            <i class="fa-solid fa-notes-medical"></i> ${cita.motivo.substring(
              0,
              60
            )}${cita.motivo.length > 60 ? "..." : ""}
          </div>
        </div>
        <div class="cita-actions">
          <button class="chip" onclick="verDetalleCita(${index})">
            <i class="fa-solid fa-eye"></i> Ver
          </button>
          <button class="chip danger" onclick="cancelarCita(${index})">
            <i class="fa-solid fa-xmark"></i> Cancelar
          </button>
        </div>
      </div>
    `
      )
      .join("");
  };

  const initSolicitarCitaView = () => {
    const btnVolverCitas = document.getElementById("btnVolverCitas");
    const formSolicitarCita = document.getElementById("formSolicitarCita");
    const fechaCita = document.getElementById("fechaCita");

    // Establecer fecha mínima como hoy
    if (fechaCita) {
      const today = new Date().toISOString().split("T")[0];
      fechaCita.setAttribute("min", today);
    }

    if (btnVolverCitas) {
      btnVolverCitas.addEventListener("click", () => {
        loadSection("citas");
      });
    }

    if (formSolicitarCita) {
      formSolicitarCita.addEventListener("submit", (e) => {
        e.preventDefault();
        handleSolicitarCita();
      });
    }
  };

  const handleSolicitarCita = () => {
    const especialidad = document.getElementById("especialidad").value;
    const fechaCita = document.getElementById("fechaCita").value;
    const horario = document.getElementById("horario").value;
    const motivoCita = document.getElementById("motivoCita").value;

    // Validación
    if (!especialidad || !fechaCita || !horario || !motivoCita) {
      showModal(
        false,
        "Solicitud Inválida",
        "Por favor complete todos los campos"
      );
      return;
    }

    // Crear nueva cita
    const nuevaCita = {
      id: Date.now(),
      especialidad,
      fecha: formatearFecha(fechaCita),
      horario,
      motivo: motivoCita,
      estado: "Pendiente",
      fechaCreacion: new Date().toISOString(),
    };

    // Guardar cita
    const citas = getCitas();
    citas.push(nuevaCita);
    saveCitas(citas);

    // Mostrar modal de éxito
    showModal(
      true,
      "Solicitud Enviada",
      "Su cita ha sido agendada exitosamente"
    );
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO + "T00:00:00");
    const opciones = { day: "numeric", month: "short", year: "numeric" };
    return fecha.toLocaleDateString("es-ES", opciones);
  };

  const showModal = (success, title, message) => {
    const modal = document.getElementById("modalResultado");
    const modalIcon = document.getElementById("modalIcon");
    const modalTitle = document.getElementById("modalTitle");
    const modalMessage = document.getElementById("modalMessage");
    const btnModalSiguiente = document.getElementById("btnModalSiguiente");

    if (!modal) return;

    // Configurar modal
    modalIcon.className = success ? "modal-icon success" : "modal-icon error";
    modalIcon.innerHTML = success
      ? '<i class="fa-solid fa-check"></i>'
      : '<i class="fa-solid fa-xmark"></i>';
    modalTitle.textContent = title;
    modalMessage.textContent = message;

    // Mostrar modal
    modal.style.display = "flex";

    // Manejar click en botón
    btnModalSiguiente.onclick = () => {
      modal.style.display = "none";
      if (success) {
        loadSection("citas");
      }
    };
  };

  window.verDetalleCita = (index) => {
    const citas = getCitas();
    const cita = citas[index];
    alert(
      `Detalles de la Cita:\n\nEspecialidad: ${cita.especialidad}\nFecha: ${cita.fecha}\nHorario: ${cita.horario}\nMotivo: ${cita.motivo}\nEstado: ${cita.estado}`
    );
  };

  window.cancelarCita = (index) => {
    if (confirm("¿Está seguro que desea cancelar esta cita?")) {
      const citas = getCitas();
      citas.splice(index, 1);
      saveCitas(citas);
      renderCitas();
    }
  };

  // ---------- VISTA DE RESULTADOS DE LABORATORIO ---------- //
  const initResultadosView = () => {
    const pruebasTbody = document.getElementById("pruebas-tbody");

    if (pruebasTbody) {
      renderPruebas();
    }
  };

  const renderPruebas = () => {
    const pruebasTbody = document.getElementById("pruebas-tbody");
    const pruebas = getPruebas();

    if (pruebas.length === 0) {
      pruebasTbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 2rem;">
            <p style="color: #666;">No hay pruebas de laboratorio disponibles</p>
          </td>
        </tr>
      `;
      return;
    }

    pruebasTbody.innerHTML = pruebas
      .map(
        (prueba) => `
      <tr>
        <td>
          <span class="examen-nombre">${prueba.nombre}</span>
        </td>
        <td>${prueba.fecha}</td>
        <td>
          <span class="badge disponible">${prueba.estado}</span>
        </td>
        <td>
          <button class="btn btn-primary" onclick="verResultadoPDF(${prueba.id}, '${prueba.nombre}', '${prueba.pdfUrl}')">
            Ver Resultados
          </button>
        </td>
      </tr>
    `
      )
      .join("");
  };

  // ---------- PDF ---------- //
  const initVerResultadoView = () => {
    // La URL del PDF se cargará desde sessionStorage
    const pdfData = sessionStorage.getItem("currentPDF");

    if (pdfData) {
      const { nombre, url } = JSON.parse(pdfData);
      const pdfViewer = document.getElementById("pdf-viewer");
      const subtitle = document.getElementById("resultado-subtitle");
      const pdfLinkContainer = document.getElementById("pdf-link-container");

      if (pdfViewer) {
        pdfViewer.src = url;
      }

      if (subtitle) {
        subtitle.textContent = `Resultado: ${nombre}`;
      }

      if (pdfLinkContainer) {
        pdfLinkContainer.innerHTML = `
        <a href="${url}" target="_blank" rel="noopener" style="color:#1976d2;word-break:break-all;">
          <i class="fa-solid fa-link"></i> Abrir PDF público
        </a>
        <br>
        <span style="font-size:0.85rem;color:#666;">${url}</span>
      `;
      }

      const btnVolverResultados = document.getElementById(
        "btnVolverResultados"
      );
      if (btnVolverResultados) {
        btnVolverResultados.onclick = () => {
          loadSection("resultados");
        };
      }
    }
  };

  // ---------- FUNCIONES GLOBALES ---------- //
  window.verResultadoPDF = (id, nombre, url) => {
    // Guardar datos del PDF en sessionStorage
    sessionStorage.setItem("currentPDF", JSON.stringify({ id, nombre, url }));

    // Navegar a la vista de visualización
    loadSection("ver-resultado");
  };

  // ---------- EVENTOS ---------- //

  // Toggle sidebar
  sidebarToggle.addEventListener("click", toggleSidebar);
  sidebarToggle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleSidebar();
    }
  });

  // Click en links del sidebar
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // marcar activo
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      // cargar sección
      const section =
        link.dataset.section || link.getAttribute("href").substring(1);
      loadSection(section);

      // cerrar sidebar en mobile al seleccionar link
      if (isMobile()) closeSidebar();
    });
  });

  // Ajustar sidebar al redimensionar
  window.addEventListener("resize", () => {
    if (isMobile()) {
      closeSidebar();
    } else {
      sidebar.style.transform = "";
      sidebar.classList.remove("collapsed");
    }
  });

  // ---------- CARGA INICIAL ---------- //
  loadSection("overview");
  if (isMobile()) {
    sidebar.style.transform = "translateX(-100%)"; // inicia cerrado en mobile
  } else {
    sidebar.classList.remove("collapsed"); // inicia abierto en desktop
  }
});
