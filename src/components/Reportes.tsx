import { BASE_URL } from "@/lib/api";
import React, {
  useState,
  useEffect,
  ChangeEvent,
  useMemo,
  useDeferredValue,
} from "react";

export const Reportes = () => {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [artistas, setArtistas] = useState<any[]>([]);
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [emisoras, setEmisoras] = useState<any[]>([]);
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [configuraciones, setConfiguraciones] = useState<any[]>([]);

  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    artistasIds: [] as string[],
    emisoras: [] as string[],
  });

  const [guardando, setGuardando] = useState(false);
  const [busquedaStream, setBusquedaStream] = useState("");
  const [busquedaArtista, setBusquedaArtista] = useState("");
  const [busquedaEmisora, setBusquedaEmisora] = useState("");
  //Infinite scroll
  const [limiteArtistas, setLimiteArtistas] = useState(50);
  const [limiteEmisoras, setLimiteEmisoras] = useState(50);
  const [limiteVisible, setLimiteVisible] = useState(50);
  // Estados para dropdowns colapsables
  const [expandirArtistas, setExpandirArtistas] = useState(false);
  const [expandirEmisoras, setExpandirEmisoras] = useState(false);
  // Estados para modal de recuperación de audios
  const [mostrarModalRec, setMostrarModalRec] = useState(false);
  const [estadoRec, setEstadoRec] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [mensajeRec, setMensajeRec] = useState("");
  const [emisorasRec, setEmisorasRec] = useState<number[]>([]);
  const [fechaInicioRec, setFechaInicioRec] = useState("");
  const [fechaFinRec, setFechaFinRec] = useState("");
  const [busquedaEmisoraRec, setBusquedaEmisoraRec] = useState("");
  const [limiteEmisorasRec, setLimiteEmisorasRec] = useState(50);
  const busquedaEmisoraRecDiferida = useDeferredValue(busquedaEmisoraRec);
  useEffect(() => {
    //fetch("http://localhost:8080/api/reportes/artistas")
    //fetch("https://backevent.monitorlatino.com/api/reportes/artistas")
    fetch(`${BASE_URL}/api/reportes/artistas`)
      .then((res) => res.json())
      .then((data) => setArtistas(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando artistas:", err));

    //fetch("http://localhost:8080/api/reportes/emisoras")
    //fetch("https://backevent.monitorlatino.com/api/reportes/emisoras")
    fetch(`${BASE_URL}/api/reportes/emisoras`)
      .then((res) => res.json())
      .then((data) => {
        console.log("👉 ASÍ LLEGAN LAS EMISORAS:", data[0]); // <--- AGREGA ESTA LÍNEA
        setEmisoras(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error cargando emisoras:", err));

    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = () => {
    //fetch("http://localhost:8080/api/configuracion/estaciones")
    //fetch("https://backevent.monitorlatino.com/api/configuracion/estaciones")
    fetch(`${BASE_URL}/api/configuracion/estaciones`)
      .then((res) => res.json())
      .then((data) => setConfiguraciones(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando configuración:", err));
  };

  const descargarReporte = (tipo: "agrupado" | "detallado") => {
    // Validar si hay fechas (opcional, pero recomendado)
    if (!filtros.fechaInicio || !filtros.fechaFin) {
      alert("Por favor selecciona un rango de fechas");
      return;
    }

    const params = new URLSearchParams();
    // Los nombres de la izquierda deben ser IGUALES a los @RequestParam de Java
    params.append("fechaInicio", filtros.fechaInicio);
    params.append("fechaFin", filtros.fechaFin);
    params.append("tipo", tipo);

    // Agregar IDs de artistas
    filtros.artistasIds.forEach((id) => params.append("artistasIds", id));

    // Agregar Emisoras
    filtros.emisoras.forEach((e) => params.append("emisoras", e));

    //const url = `http://localhost:8080/api/reportes/descargar?${params.toString()}`;
    //const url = `https://backevent.monitorlatino.com/api/reportes/descargar?${params.toString()}`;
    const url = `${BASE_URL}/api/reportes/descargar?${params.toString()}`;
    // Abrir en pestaña nueva para iniciar descarga
    window.open(url, "_blank");
  };
  // Función para el modal de recuperación: filtrar emisoras para mostrar en el modal
  const emisorasModalFiltradas = useMemo(() => {
    const bus = busquedaEmisoraRecDiferida.toLowerCase();
    const lista = Array.isArray(configuraciones) ? configuraciones : [];
    return lista.filter((c) => {
      const nombre = (c.stream_desc || "").toLowerCase();
      const id = (c.stream_id || "").toString();
      return nombre.includes(bus) || id.includes(bus);
    });
  }, [busquedaEmisoraRecDiferida, configuraciones]);
  // scroll para emisoras en modal de recuperación
  const scrollEmisorasRec = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 20) {
      setLimiteEmisorasRec((prev) => prev + 50);
    }
  };
  // Función para recuperar audios atrasados
  const procesarRecuperacion = async () => {
    if (!fechaInicioRec || !fechaFinRec || emisorasRec.length === 0) {
      setEstadoRec("error");
      setMensajeRec("Selecciona fechas y al menos una emisora.");
      return;
    }
    setEstadoRec("loading");
    try {
      const params = new URLSearchParams();
      params.append("fechaInicio", fechaInicioRec);
      params.append("fechaFin", fechaFinRec);

      //const res = await fetch(`http://localhost:8080/api/reportes/reprocesar-audios?${params.toString()}`, {
      //const res = await fetch(`https://backevent.monitorlatino.com/api/reportes/reprocesar-audios?${params.toString()}`, {
      const res = await fetch(
        `${BASE_URL}/api/reportes/reprocesar-audios?${params.toString()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emisorasRec),
        },
      );
      if (!res.ok) {
        const errorText = await res.text(); // Leemos como texto, no como JSON
        setEstadoRec("error");
        setMensajeRec(errorText);
        return; // Detenemos la ejecución aquí
      }

      const data = await res.json();
      setEstadoRec("success");
      setMensajeRec(
        `¡Éxito! Se encontraron ${data.length} audios y se enviaron a la IA.`,
      );

      // Si el backend mandó un string, es que está vacío o hubo un mensaje personalizado
      if (typeof data === "string") {
        setEstadoRec("error");
        setMensajeRec(data);
      } else {
        setEstadoRec("success");
        // AQUÍ VA LA CONEXIÓN A TU IA (Actualmente simulada)
        setMensajeRec(
          `¡Éxito! Se encontraron ${data.length} audios y se enviaron a procesar a la IA. Estarán listos para tu reporte en unos minutos.`,
        );
      }
    } catch (error) {
      console.error(error);
      setEstadoRec("error");
      setMensajeRec(
        "Error al conectar con el servidor para buscar audios históricos.",
      );
    }
  };

  const cerrarModalRecuperacion = () => {
    setMostrarModalRec(false);
    setEstadoRec("idle");
    setMensajeRec("");
    setEmisorasRec([]);
    setFechaInicioRec("");
    setFechaFinRec("");
  };

  const toggleEmisoraRecuperacion = (streamId: number) => {
    setEmisorasRec((prev) =>
      prev.includes(streamId)
        ? prev.filter((id) => id !== streamId)
        : [...prev, streamId],
    );
  };

  const artistasFiltrados = useMemo(() => {
    const bus = busquedaArtista.toLowerCase();
    const lista = Array.isArray(artistas) ? artistas : [];
    return lista.filter((a) => a.nombre?.toLowerCase().includes(bus));
  }, [busquedaArtista, artistas]);

  const emisorasFiltradas = useMemo(() => {
    const bus = busquedaEmisora.toLowerCase();
    const lista = Array.isArray(emisoras) ? emisoras : [];

    return lista.filter((e) => {
      const nombre = (e.nombre || "").toLowerCase();
      const id = (e.id || "").toString();
      const ciudad = (e.ciudad || "").toLowerCase();

      return nombre.includes(bus) || id.includes(bus) || ciudad.includes(bus);
    });
  }, [busquedaEmisora, emisoras]);

  const configFiltrada = useMemo(() => {
    const bus = busquedaStream.toLowerCase();
    const lista = Array.isArray(configuraciones) ? configuraciones : [];
    return lista.filter((c) => {
      const id = (c.stream_id || "").toString();
      const nombre = (c.stream_desc || "").toLowerCase();
      const ciudad = (c.ciudad || "").toLowerCase();
      return id.includes(bus) || nombre.includes(bus) || ciudad.includes(bus);
    });
  }, [busquedaStream, configuraciones]);

  //Handlers
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (
    e: ChangeEvent<HTMLInputElement>,
    campo: "artistasIds" | "emisoras",
  ) => {
    const { value, checked } = e.target;
    setFiltros((prev) => {
      const listaActual = prev[campo];
      if (checked) return { ...prev, [campo]: [...listaActual, value] };
      return { ...prev, [campo]: listaActual.filter((item) => item !== value) };
    });
  };

  const toggleEstacionActiva = (streamId: number) => {
    setConfiguraciones((prev) =>
      prev.map((config) => {
        if (config.stream_id === streamId) {
          const actualmenteActivo =
            config.activo === 1 || config.activo === true;
          return { ...config, activo: actualmenteActivo ? 0 : 1 };
        }
        return config;
      }),
    );
  };

  const guardarConfiguracion = () => {
    setGuardando(true);
    const streamsActivos = configuraciones
      .filter((c) => c.activo === 1 || c.activo === true)
      .map((c) => c.stream_id);

    //fetch("http://localhost:8080/api/configuracion/guardar", {
    //fetch("https://backevent.monitorlatino.com/api/configuracion/guardar", {
    fetch(`${BASE_URL}/api/configuracion/guardar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(streamsActivos),
    })
      .then((res) =>
        res.ok ? alert("¡Monitoreo actualizado!") : alert("Error al guardar"),
      )
      .catch((err) => console.error("Error:", err))
      .finally(() => setGuardando(false));
  };

  // FUNCIÓN PARA DETECTAR SCROLL AL FINAL
  const manejarScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      setLimiteVisible((prev) => prev + 50);
    }
  };
  // Función scroll al final para artistas en Reportes
  const scrollArtistas = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 20) {
      setLimiteArtistas((prev) => prev + 50);
    }
  };
  // Función scroll al final para emisoras en Reportes
  const scrollEmisoras = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 20) {
      setLimiteEmisoras((prev) => prev + 50);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto mt-6 mb-10 px-4">
      {/* TARJETA: GENERADOR DE REPORTES */}
      <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-yellow-400 pl-3">
          Generador de Reportes
        </h2>

        {/* Fila de Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Filtrar por Fecha Inicio
            </label>
            <input
              type="datetime-local"
              name="fechaInicio"
              value={filtros.fechaInicio}
              onChange={handleChange}
              className="border p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Filtrar por Fecha Fin
            </label>
            <input
              type="datetime-local"
              name="fechaFin"
              value={filtros.fechaFin}
              onChange={handleChange}
              className="border p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400"
            />
          </div>
        </div>

        {/* Fila de Selectores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* COLUMNA ARTISTAS */}
          <div className="flex flex-col relative">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Filtrar por Artistas
            </label>
            <button
              onClick={() => setExpandirArtistas(!expandirArtistas)}
              className={`w-full flex justify-between items-center p-2 border rounded-lg bg-white transition-all text-sm ${expandirArtistas ? "border-blue-600 ring-2 ring-blue-50" : "hover:border-blue-300"}`}
            >
              <span className="text-gray-700 font-medium">
                {filtros.artistasIds.length === 0
                  ? "Todos los artistas"
                  : `${filtros.artistasIds.length} seleccionados`}
              </span>
              <span className="text-blue-600">
                {expandirArtistas ? "▲" : "▼"}
              </span>
            </button>

            {/* Etiquetas de seleccionados (Solo se ven cuando está cerrado) */}
            {!expandirArtistas && filtros.artistasIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {filtros.artistasIds.map((id) => {
                  const nombre = artistas.find(
                    (a) => a.id.toString() === id,
                  )?.nombre;
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-[11px] font-bold animate-fadeIn"
                    >
                      <span>{nombre}</span>
                      <button
                        onClick={() =>
                          handleCheckboxChange(
                            //eslint-disable-next-line @typescript-eslint/no-explicit-any
                            { target: { value: id, checked: false } } as any,
                            "artistasIds",
                          )
                        }
                        className="ml-1 hover:text-yellow-400 transition-colors font-black text-sm leading-none"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {expandirArtistas && (
              <div className="mt-2 p-3 border rounded-lg bg-white shadow-xl absolute z-30 w-full top-full animate-fadeIn border-t-4 border-t-blue-600">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-blue-600">
                    Buscador de Artistas
                  </span>
                  <button
                    onClick={() => setExpandirArtistas(false)}
                    className="text-gray-400 hover:text-red-500 text-lg font-bold"
                  >
                    ×
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Escribe nombre del artista..."
                  className="w-full border p-2 rounded-md mb-2 text-sm focus:border-yellow-400 outline-none transition-colors"
                  value={busquedaArtista}
                  onChange={(e) => {
                    setBusquedaArtista(e.target.value);
                    setLimiteArtistas(50);
                  }}
                />
                <div
                  className="h-44 overflow-y-auto pr-1 custom-scrollbar"
                  onScroll={scrollArtistas}
                >
                  {artistasFiltrados.slice(0, limiteArtistas).map((a) => (
                    <label
                      key={a.id}
                      className="flex items-center gap-2 p-1.5 hover:bg-yellow-50 rounded cursor-pointer transition-colors group"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        value={a.id}
                        checked={filtros.artistasIds.includes(a.id.toString())}
                        onChange={(e) => handleCheckboxChange(e, "artistasIds")}
                      />
                      <span className="text-xs text-gray-700 group-hover:text-blue-700">
                        {a.nombre}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA EMISORAS */}
          <div className="flex flex-col relative">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Filtrar por Emisoras
            </label>
            <button
              onClick={() => setExpandirEmisoras(!expandirEmisoras)}
              className={`w-full flex justify-between items-center p-2 border rounded-lg bg-white transition-all text-sm ${expandirEmisoras ? "border-blue-600 ring-2 ring-blue-50" : "hover:border-blue-300"}`}
            >
              <span className="text-gray-700 font-medium">
                {filtros.emisoras.length === 0
                  ? "Todas las emisoras"
                  : `${filtros.emisoras.length} seleccionadas`}
              </span>
              <span className="text-blue-600">
                {expandirEmisoras ? "▲" : "▼"}
              </span>
            </button>

            {/* Etiquetas de seleccionadas */}
            {!expandirEmisoras && filtros.emisoras.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {filtros.emisoras.map((nombre, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-[11px] font-bold animate-fadeIn"
                  >
                    <span className="max-w-[150px] truncate">{nombre}</span>
                    <button
                      onClick={() =>
                        handleCheckboxChange(
                          //eslint-disable-next-line @typescript-eslint/no-explicit-any
                          { target: { value: nombre, checked: false } } as any,
                          "emisoras",
                        )
                      }
                      className="ml-1 hover:text-indigo-600 transition-colors font-black text-sm leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {expandirEmisoras && (
              <div className="mt-2 p-3 border rounded-lg bg-white shadow-xl absolute z-30 w-full top-full animate-fadeIn border-t-4 border-t-yellow-400">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-yellow-600">
                    Buscador de Emisoras
                  </span>
                  <button
                    onClick={() => setExpandirEmisoras(false)}
                    className="text-gray-400 hover:text-red-500 text-xl"
                  >
                    ×
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Escribe ID, ciudad o emisora..."
                  className="w-full border p-2 rounded-md mb-2 text-sm focus:border-blue-500 outline-none transition-colors"
                  value={busquedaEmisora}
                  onChange={(e) => {
                    setBusquedaEmisora(e.target.value);
                    setLimiteEmisoras(50);
                  }}
                />
                <div
                  className="h-44 overflow-y-auto pr-1 custom-scrollbar"
                  onScroll={scrollEmisoras}
                >
                  {emisorasFiltradas.slice(0, limiteEmisoras).map((e, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2 p-1.5 hover:bg-blue-50 rounded cursor-pointer transition-colors group"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                        value={e.id}
                        checked={filtros.emisoras.includes(e.id)}
                        onChange={(e) => handleCheckboxChange(e, "emisoras")}
                      />
                      <span className="text-xs text-gray-700 group-hover:text-yellow-700">
                        {e.nombre}{" "}
                        {e.id && (
                          <span className="text-gray-400 ml-1">({e.id})</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* BOTONES PEQUEÑOS */}
     {/* BOTONES PEQUEÑOS */}
        <div className="flex justify-end gap-4 border-t border-gray-100 pt-6">
          
          {/* Contenedor Botón Agrupado */}
          <div className="relative group">
            <button
              onClick={() => descargarReporte('agrupado')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg text-sm transition-all shadow-md shadow-blue-100 active:scale-95"
            >
              Reporte Agrupado
            </button>
            {/* Tooltip Agrupado (White Glass) */}
            <div className="absolute bottom-full right-0 mb-3 hidden group-hover:block w-64 p-3 bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl z-20 pointer-events-none animate-fadeIn rounded-2xl">
              <p className="font-bold text-blue-700 mb-1 text-xs">Campos incluidos:</p>
              <p className="leading-relaxed text-gray-600 text-xs">Cadena, Estación, Artista y Veces mencionado.</p>
              {/* Triangulito apuntando hacia abajo (Blanco) */}
              <div className="absolute top-full right-10 border-4 border-transparent border-t-white/90"></div>
            </div>
          </div>

          {/* Contenedor Botón Detallado */}
          <div className="relative group">
            <button
              onClick={() => descargarReporte('detallado')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg text-sm transition-all shadow-md shadow-green-100 active:scale-95"
            >
              Reporte Detallado
            </button>
            {/* Tooltip Detallado (White Glass) */}
            <div className="absolute bottom-full right-0 mb-3 hidden group-hover:block w-80 p-3 bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl z-20 pointer-events-none animate-fadeIn rounded-2xl">
              <p className="font-bold text-green-700 mb-1 text-xs">Campos incluidos:</p>
              <p className="leading-relaxed text-gray-600 text-xs">Estación, Ciudad, Cadena, Fecha de detección, Fecha del evento, Venue, Tipo, Duración, Audio URL, Respuesta de IA, Transcripción y Categoría.</p>
              {/* Triangulito apuntando hacia abajo (Blanco) */}
              <div className="absolute top-full right-12 border-4 border-transparent border-t-white/90"></div>
            </div>
          </div>

        </div>
      </div>
      {/* TARJETA: CONFIGURACIÓN (TABLA) */}
      <div className="p-6 bg-white rounded-xl shadow-md border-l-8 border-indigo-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Monitoreo de Estaciones
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setMostrarModalRec(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md active:scale-95 text-sm"
            >
              Recuperar Audios Olvidados
            </button>
            <button
              onClick={guardarConfiguracion}
              disabled={guardando}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-lg font-bold transition-all disabled:bg-gray-400"
            >
              {guardando ? "Procesando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Filtrar por ID, Nombre o Ciudad..."
            className="w-full border-2 border-gray-200 p-3 pl-10 rounded-xl focus:border-indigo-500 outline-none"
            value={busquedaStream}
            onChange={(e) => {
              setBusquedaStream(e.target.value);
              setLimiteVisible(50);
            }}
          />
          <span className="absolute left-3 top-3.5 opacity-30">🔍</span>
        </div>

        <div
          className="border rounded-xl overflow-hidden max-h-[500px] overflow-y-auto relative shadow-inner bg-gray-50"
          onScroll={manejarScroll}
        >
          <table className="w-full text-sm border-collapse bg-white">
            <thead className="sticky top-0 z-20 shadow-sm bg-gray-100">
              <tr className="text-gray-600 uppercase text-xs tracking-wider">
                <th className="p-4 border-b w-24">Estado</th>
                <th className="p-4 border-b text-left w-20">ID</th>
                <th className="p-4 border-b text-left">Emisora</th>
                <th className="p-4 border-b text-left">Ciudad</th>
              </tr>
            </thead>
            <tbody>
              {configFiltrada.slice(0, limiteVisible).map((config) => {
                const estaActivo =
                  config.activo === 1 || config.activo === true;

                return (
                  <tr
                    key={config.stream_id}
                    className="border-b hover:bg-indigo-50/30 transition-colors"
                  >
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleEstacionActiva(config.stream_id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${estaActivo ? "bg-yellow-500" : "bg-gray-300"}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${estaActivo ? "translate-x-6" : "translate-x-1"}`}
                        />
                      </button>
                    </td>
                    <td className="p-4 font-black text-indigo-600">
                      {config.stream_id}
                    </td>
                    <td className="p-4 text-gray-800 font-medium">
                      {config.stream_desc}
                    </td>
                    <td className="p-4 italic text-gray-500">
                      {config.ciudad}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {limiteVisible < configFiltrada.length && (
            <div className="p-6 text-center text-gray-400 italic">
              Desliza para cargar más...
            </div>
          )}
        </div>
      </div>
      {/* MODAL DE RECUPERACIÓN DE AUDIOS */}
      {mostrarModalRec && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-amber-500 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">
                Recuperar Audios No Monitoreados
              </h3>
              <button
                onClick={cerrarModalRecuperacion}
                className="text-white hover:text-amber-200 text-2xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <p className="text-sm text-gray-600 mb-4">
                Selecciona las fechas y las estaciones que olvidaste monitorear.
                Buscaremos los audios guardados y los mandaremos a analizar con
                la IA.
              </p>

              {estadoRec !== "idle" && (
                <div
                  className={`p-3 mb-4 rounded-lg text-sm font-bold ${estadoRec === "loading" ? "bg-blue-50 text-blue-700" : estadoRec === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
                >
                  {estadoRec === "loading"
                    ? "Buscando audios en el servidor..."
                    : mensajeRec}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    Fecha Inicio
                  </label>
                  <input
                    type="datetime-local"
                    value={fechaInicioRec}
                    onChange={(e) => setFechaInicioRec(e.target.value)}
                    className="w-full border p-2 rounded text-sm outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    Fecha Fin
                  </label>
                  <input
                    type="datetime-local"
                    value={fechaFinRec}
                    onChange={(e) => setFechaFinRec(e.target.value)}
                    className="w-full border p-2 rounded text-sm outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Buscar Emisoras ({emisorasRec.length} seleccionadas)
                </label>
                <input
                  type="text"
                  placeholder="Escribe el nombre de la emisora..."
                  value={busquedaEmisoraRec}
                  onChange={(e) => {
                    setBusquedaEmisoraRec(e.target.value);
                    setLimiteEmisorasRec(50);
                  }}
                  className="w-full border p-2 rounded mb-2 text-sm outline-none focus:border-amber-400"
                />

                <div
                  className="border rounded h-40 overflow-y-auto p-2 bg-gray-50 custom-scrollbar"
                  onScroll={scrollEmisorasRec}
                >
                  {emisorasModalFiltradas
                    .slice(0, limiteEmisorasRec)
                    .map((c) => (
                      <label
                        key={c.stream_id}
                        className="flex items-center gap-2 p-1.5 hover:bg-amber-50 rounded cursor-pointer transition-colors border-b border-gray-100 last:border-0"
                      >
                        <input
                          type="checkbox"
                          checked={emisorasRec.includes(c.stream_id)}
                          onChange={() =>
                            toggleEmisoraRecuperacion(c.stream_id)
                          }
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                        />
                        <span className="text-sm text-gray-700">
                          {c.stream_desc}{" "}
                          <span className="text-xs text-gray-400">
                            ({c.stream_id})
                          </span>
                        </span>
                      </label>
                    ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 border-t flex justify-end gap-3">
              <button
                onClick={cerrarModalRecuperacion}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={procesarRecuperacion}
                disabled={estadoRec === "loading"}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
              >
                {estadoRec === "loading"
                  ? "Procesando..."
                  : "Recuperar e Iniciar IA"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reportes;
