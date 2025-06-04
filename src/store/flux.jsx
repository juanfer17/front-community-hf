import { BACKEND_URL } from "../config";

const getState = ({ getStore, getActions, setStore }) => {
    const secureFetch = async (url, options = {}) => {
        const token = localStorage.getItem("token");
        if (!options.headers) options.headers = {};
        options.headers["Authorization"] = `Bearer ${token}`;

        try {
            const response = await fetch(url, options);

            if (response.status === 401 || response.status === 403) {
                getActions().logout(); // Cierra sesión automáticamente
                return { success: false, message: "Sesión expirada. Por favor, inicia sesión nuevamente." };
            }

            return response;
        } catch (error) {
            console.error("Error en secureFetch:", error);
            return { success: false, message: "Error de conexión con el servidor." };
        }
    };
    return {
        store: {
            token: localStorage.getItem("token") || null,
            role: localStorage.getItem("role") || null,
            jugadores: [],
            torneos: [],
            equipos: [],
            partidos: [],
            asistencias: [],
            tablaGoleadores: [],
            tablaAsistidores: [],
            tablaEquipos: [],
            torneoSeleccionado: null,
            tablaMvps: [],
            tablaMenciones: [],
            convocatorias: [],
            ofertas: [],
            playersWithRoles: [],
            noticias: []
        },
        actions: {

            aceptarOferta: async (ofertaId, jugadorId, modalidad) => {
                try {
                    const token = localStorage.getItem("token");
                    if (!token) throw new Error("No hay token disponible.");

                    const response = await fetch(`${BACKEND_URL}/${modalidad}/offers/accept`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ offerId: ofertaId })
                    });

                    // Solo parsear si hay body
                    let data = null;
                    const contentLength = response.headers.get("content-length");
                    if (contentLength && contentLength !== "0") {
                        data = await response.json();
                    }

                    if (!response.ok) throw new Error(data?.error || "Error al aceptar la oferta");

                    alert("Oferta aceptada correctamente.");
                    getActions().getOfertas(jugadorId, modalidad);
                    getActions().getConvocatorias(modalidad);

                    return { success: true, data };
                } catch (error) {
                    alert(error.message);
                    return { success: false };
                }
            },

            addPlayerToTeam: async (jugadorId, equipoId) => {
                try {
                    const token = localStorage.getItem("token"); // Obtener token JWT
                    const response = await fetch(`${BACKEND_URL}/players/add_team`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            jugador_id: jugadorId,
                            equipo_id: equipoId
                        }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || "Error al añadir jugador al equipo");
                    }

                    alert("Jugador añadido correctamente");
                    return data;
                } catch (error) {
                    console.error("Error al añadir jugador al equipo:", error);
                    alert("Error al añadir jugador");
                }
            },

            crearConvocatoria: async (jugadorId, mensaje, modalidad) => {
                try {
                    // Llamada al backend usando fetch sin autenticación`);
                    const response = await fetch(`${BACKEND_URL}/${modalidad}/callups`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            playerId: jugadorId,
                            message: mensaje
                        })
                    });

                    if (!response.ok) throw new Error("Error al crear la convocatoria");

                    const data = await response.json();

                    alert("Convocatoria creada con éxito.");
                    getActions().getConvocatorias(modalidad); // Recargar convocatorias
                    return {success: true};
                } catch (error) {
                    console.error("❌ Error en crearConvocatoria:", error);
                    return {success: false};
                }
            },

            crearEquipo: async (datos) => {
                try {
                    let formData = new FormData();
                    formData.append("nombre", datos.nombre);
                    formData.append("torneo_id", datos.torneo_id);
                    if (datos.logo) {
                        formData.append("logo", datos.logo);
                    }

                    const token = localStorage.getItem("token");

                    if (!token) {
                        return {success: false, message: "No tienes una sesión activa"};
                    }

                    const resp = await secureFetch(`${BACKEND_URL}/equipos`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        },
                        body: formData,
                    });

                    const data = await resp.json();
                    return {success: resp.ok, message: data.message || data.error};

                } catch (error) {
                    return {success: false, message: "Error al conectar con el servidor"};
                }
            },

            crearNoticia: async (titulo, contenido, imagen) => {
                try {
                    let formData = new FormData();
                    formData.append("titulo", titulo);
                    formData.append("contenido", contenido);
                    if (imagen) {
                        formData.append("imagen", imagen);
                    }

                    const token = localStorage.getItem("token");

                    if (!token) {
                        return {success: false, message: "No tienes una sesión activa"};
                    }

                    const response = await fetch(`${BACKEND_URL}/noticias`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        },
                        body: formData,
                    });

                    const data = await response.json();
                    return {success: response.ok, message: data.message || data.error, imagen_url: data.imagen_url};

                } catch (error) {
                    return {success: false, message: "Error al conectar con el servidor"};
                }
            },

            crearTorneo: async (nombre, modalidad, formato) => {
                const store = getStore();

                // 🚨 Validar que el usuario sea admin antes de hacer la solicitud
                if (store.role !== "admin") {
                    console.error("Acceso denegado: el usuario no es administrador");
                    return {success: false, message: "No tienes permisos para crear un torneo"};
                }

                try {
                    const response = await secureFetch(`${BACKEND_URL}/torneos`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${store.token}`,
                        },
                        body: JSON.stringify({nombre, modalidad, formato}),
                    });

                    const data = await response.json(); // Obtener respuesta en JSON

                    if (response.ok) {
                        await getActions().getTorneos(); // Refrescar la lista de torneos
                        return {success: true, message: "Torneo creado exitosamente"};
                    } else {
                        console.error("Error en crearTorneo:", data.error);
                        return {success: false, message: data.error || "Error desconocido"};
                    }
                } catch (error) {
                    console.error("Error en la petición:", error);
                    return {success: false, message: "Error en la conexión con el servidor"};
                }
            },

            createPlayerByAdmin: async (nickhabbo) => {
                try {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        return {success: false, message: "No estás autenticado"};
                    }

                    const response = await secureFetch(`${BACKEND_URL}/jugadores/noregistrados`, { // ✅ CORREGIDO
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,

                        },
                        body: JSON.stringify({nickhabbo}),
                    });

                    const data = await response.json();
                    console.log("Respuesta del servidor:", data); // Depuración

                    if (!response.ok) {
                        console.error("Error en createPlayerByAdmin:", data.error);
                        return {success: false, message: data.error || "Error desconocido"};
                    }

                    return {success: true, message: "Jugador creado correctamente"};

                } catch (error) {
                    console.error("Error en createPlayerByAdmin:", error);
                    return {success: false, message: "Error de conexión con el servidor"};
                }
            },

            deletePlayer: async (playerId) => {
                try {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        return {success: false, message: "No estás autenticado"};
                    }

                    const response = await secureFetch(`${BACKEND_URL}/jugadores/${playerId}`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,

                        }
                    });

                    const data = await response.json();
                    console.log("Respuesta del servidor:", data);

                    if (!response.ok) {
                        console.error("Error en deletePlayer:", data.message);
                        return {success: false, message: data.message || "Error desconocido"};
                    }

                    return {success: true, message: "Jugador eliminado correctamente"};

                } catch (error) {
                    console.error("Error en deletePlayer:", error);
                    return {success: false, message: "Error de conexión con el servidor"};
                }
            },

            editarNoticia: async (id, titulo, contenido, imagenUrl) => {
                try {
                    const token = localStorage.getItem("token"); // 🔹 Obtiene el token
                    const response = await fetch(`${BACKEND_URL}/noticias/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`  // 🔹 Agrega el token aquí
                        },
                        body: JSON.stringify({titulo, contenido, imagenUrl})
                    });
                    if (!response.ok) throw new Error("Error al editar noticia");

                    getActions().obtenerNoticias();
                } catch (error) {
                    console.error("Error al editar noticia:", error);
                }
            },

            eliminarConvocatoria: async (convocatoriaId, modalidad) => {
                try {
                    const response = await fetch(`${BACKEND_URL}/jugador/eliminar_convocatoria/${convocatoriaId}`, {
                        method: "DELETE"
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || "Error al eliminar la convocatoria");
                    }

                    alert("Convocatoria eliminada con éxito.");
                    getActions().getConvocatorias(modalidad); // Recargar después de eliminar
                } catch (error) {
                    alert(error.message); // Mostrar mensaje de error
                }
            },

            eliminarEquipo: async (equipoId) => {
                try {
                    // 🔹 Obtener el token del usuario desde localStorage (o donde lo almacenes)
                    const token = localStorage.getItem("token");

                    if (!token) {
                        console.error("No tienes una sesión activa");
                        return false;
                    }

                    const response = await secureFetch(`${BACKEND_URL}/equipos/${equipoId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`  // ✅ Agregamos el token aquí
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Error al eliminar el equipo');
                    }

                    return true;
                } catch (error) {
                    console.error('Error:', error);
                    return false;
                }
            },

            eliminarNoticia: async (id) => {
                try {
                    const token = localStorage.getItem("token"); // 🔹 Obtiene el token
                    const response = await fetch(`${BACKEND_URL}/noticias/${id}`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${token}`  // 🔹 Agrega el token aquí
                        }
                    });
                    if (!response.ok) throw new Error("Error al eliminar noticia");

                    getActions().obtenerNoticias();
                } catch (error) {
                    console.error("Error al eliminar noticia:", error);
                }
            },

            eliminarTorneo: async (torneoId) => {
                try {
                    const token = localStorage.getItem("token"); // 🔐 Obtén el token de autenticación
                    if (!token) {
                        console.error("No hay token disponible");
                        return false;
                    }

                    const response = await secureFetch(`${BACKEND_URL}/torneos/${torneoId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                            // 🔐 Envía el token en la petición
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Error al eliminar el torneo');
                    }

                    console.log(`Torneo ${torneoId} eliminado correctamente`);
                    getActions().getTorneos(); // Recargar la lista de torneos

                    return true;
                } catch (error) {
                    console.error('Error:', error);
                    return false;
                }
            },

            enviarOferta: async (modality, coachId, playerId, teamId) => {
                try {
                    if (!coachId || !playerId || !teamId || !modality) return { success: false };

                    const token = localStorage.getItem("token");
                    if (!token) throw new Error("No hay token disponible.");

                    const response = await fetch(`${BACKEND_URL}/${modality}/offers`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ coachId, playerId, teamId })
                    });

                    let data = null;

                    // Solo intentar parsear si hay contenido
                    const contentLength = response.headers.get("content-length");
                    if (contentLength && contentLength !== "0") {
                        data = await response.json();
                    }

                    if (!response.ok) {
                        throw new Error(data?.error || "Error al enviar la oferta");
                    }

                    alert("Oferta enviada con éxito.");
                    return { success: true, data };
                } catch (error) {
                    alert(error.message);
                    return { success: false };
                }
            },

            fetchWithAuth: async (url, options = {}) => {
                try {
                    const token = localStorage.getItem("token");

                    if (!token) {
                        getActions().logout();
                        return null;
                    }

                    options.headers = {
                        ...options.headers,
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    };

                    const response = await fetch(url, options);

                    if (response.status === 401) {
                        console.warn("🔹 Token expirado. Cerrando sesión...");
                        getActions().logout();
                        return null;
                    }

                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || "Error en la petición");

                    return data;
                } catch (error) {
                    console.error("❌ Error en fetchWithAuth:", error);
                    return null;
                }
            },

            getConvocatorias: async (modalidad) => {
                try {
                    // Llamada al backend usando fetch sin autenticación
                    const response = await fetch(`${BACKEND_URL}/${modalidad}/callups`);

                    if (!response.ok) throw new Error("Error al obtener convocatorias");

                    const data = await response.json();

                    // Si la respuesta es válida, actualizamos el store con las convocatorias
                    setStore({convocatorias: data});
                } catch (error) {
                    console.error("❌ Error en getConvocatorias:", error);
                    // Si hay error (por ejemplo, token expirado o problema con la API), limpiamos el store de convocatorias
                    setStore({convocatorias: []});
                }
            },

            getEquipos: async (modalidad, torneoId) => {
                try {
                    const response = await fetch(`${BACKEND_URL}/${modalidad}/teams?tournamentId=${torneoId}`);
                    const data = await response.json();

                    if (response.ok) {
                        setStore({equipos: data});
                    } else {
                        console.error("Error al obtener los equipos:", data.message);
                    }
                } catch (error) {
                    console.error("Error en getEquipos:", error);
                }
            },

            getEquiposConLogo: async (modality) => {
                try {
                    const resp = await fetch(`${BACKEND_URL}/${modality}/teams/with-logo`);
                    const data = await resp.json();

                    if (resp.ok) {
                        setStore({ equipos: data });
                    } else {
                        console.error("Error al obtener equipos:", data);
                    }
                } catch (error) {
                    console.error("❌ Error al conectar con el servidor:", error);
                }
            },

            getEquiposPorDT: async (modalidad, dtId) => {
                try {
                    const token = localStorage.getItem("token");
                    const rolesJson = localStorage.getItem("roles"); // asumiendo que guardas roles como JSON string
                    if (!token) {
                        throw new Error("No hay token disponible. Por favor, inicia sesión nuevamente.");
                    }
                    if (!rolesJson) {
                        throw new Error("No tienes permisos para acceder a esta información.");
                    }
                    const roles = JSON.parse(rolesJson);
                    const hasDtRoleForModality = roles.some(r =>
                        r.role.toLowerCase() === "dt" && r.modalityName.toLowerCase() === modalidad.toLowerCase()
                    );
                    if (!hasDtRoleForModality) {
                        throw new Error("No tienes permisos para acceder a esta información.");
                    }

                    const response = await fetch(`${BACKEND_URL}/${modalidad}/teams/dt/${dtId}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    });

                    if (!response.ok) {
                        const errorBody = await response.json();
                        throw new Error(errorBody.message || `Error al obtener los equipos (HTTP ${response.status})`);
                    }

                    const data = await response.json();
                    return data;

                } catch (error) {
                    console.error("Error en getEquiposPorDT:", error);
                    alert(error.message);
                    return [];
                }
            },

            getEquiposPorTorneo: async (torneoId) => {
                try {
                    const response = await fetch(BACKEND_URL + `/equipos/torneo/${torneoId}`);
                    if (!response.ok) throw new Error("Error al obtener los equipos");
                    const data = await response.json();
                    setStore({equipos: data});
                    return data;
                } catch (error) {
                    console.error("Error al cargar los equipos del torneo:", error);
                    return [];
                }
            },

            getJugadores: async () => {
                try {
                    const resp = await fetch(`${BACKEND_URL}/jugadores`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",

                        },
                    });

                    if (!resp.ok) {
                        const errorData = await resp.json().catch(() => ({})); // Manejar errores en JSON
                        console.error(`Error al obtener los jugadores: ${resp.status} - ${errorData.error || "Error desconocido"}`);
                        setStore({jugadores: []});
                        return;
                    }

                    const data = await resp.json();
                    setStore({jugadores: data || []});

                } catch (error) {
                    console.error("Error en getJugadores:", error);
                    setStore({jugadores: []});
                }
            },

            getJugadoresPorEquipo: async (equipoId, modalidad) => {
                try {
                    console.log("Solicitando jugadores para equipo ID:", equipoId, "Modalidad:", modalidad);

                    const url = `${BACKEND_URL}/${modalidad}/player-teams/team/${equipoId}`;
                    const resp = await fetch(url);

                    if (!resp.ok) {
                        throw new Error(`Error en la solicitud: ${resp.status}`);
                    }

                    const respText = await resp.clone().text();
                    console.log("API Response (raw):", respText);

                    const data = await resp.json();
                    console.log("Jugadores recibidos:", data);

                    return data || [];
                } catch (error) {
                    console.error("Error al obtener jugadores del equipo:", error);
                    return [];
                }
            },

            getOfertas: async (jugadorId, modalidad) => {
                try {
                    if (!jugadorId || !modalidad) return {success: false};

                    const response = await fetch(`${BACKEND_URL}/${modalidad}/offers/${jugadorId}`);
                    const data = await response.json();

                    if (!response.ok) throw new Error(data.error || "Error al obtener ofertas");

                    setStore({ofertas: data});
                } catch (error) {
                    setStore({ofertas: []});
                    return {success: false};
                }
            },

            getPlayersWithRoles: async () => {
                try {
                    const token = localStorage.getItem("token");
                    const response = await fetch(BACKEND_URL + "/jugadores/roles", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,

                        }
                    });

                    if (!response.ok) throw new Error("Error al obtener los jugadores");

                    const data = await response.json();
                    console.log("✅ Jugadores obtenidos:", data); // 👀 Ver qué llega

                    setStore({playersWithRoles: data});

                } catch (error) {
                    console.error("❌ Error al obtener jugadores con roles:", error);
                }
            },

            getTablaAsistidoresPorTorneo: async (modalidad, torneoId) => {
                try {
                    console.log(`🎯 Fetch tabla asistidores para Torneo ID: ${torneoId}`);
                    const response = await fetch(`${BACKEND_URL}/${modalidad}/statistics/top-assistants?tournamentId=${torneoId}`);

                    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

                    const data = await response.json();
                    console.log("✅ Tabla de asistidores recibida:", data);
                    setStore({tablaAsistidores: data});

                } catch (error) {
                    console.error("❌ Error en getTablaAsistidoresPorTorneo:", error);
                }
            },

            getTablaEquiposPorTorneo: async (modalidad, torneoId) => {
                try {
                    console.log(`📊 Fetch tabla posiciones para Torneo ID: ${torneoId}`);
                    const response = await fetch(`${BACKEND_URL}/${modalidad}/standings/tables?tournamentId=${torneoId}`);

                    // 🔥 Verificar si la respuesta es HTML en lugar de JSON
                    const textResponse = await response.text();
                    console.log("📩 Respuesta recibida:", textResponse);

                    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

                    // Intentar parsear como JSON
                    const data = JSON.parse(textResponse);
                    console.log("✅ Tabla de posiciones recibida:", data);
                    setStore({tablaEquipos: data});

                } catch (error) {
                    console.error("❌ Error en getTablaEquiposPorTorneo:", error);
                }
            },

            getTablaGoleadoresPorTorneo: async (modalidad, torneoId) => {
                try {
                    console.log(`⚽ Fetch tabla goleadores para Torneo ID: ${torneoId}`);
                    const response = await fetch(`${BACKEND_URL}/${modalidad}/statistics/top-scorers?tournamentId=${torneoId}`);

                    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

                    const data = await response.json();
                    console.log("✅ Tabla de goleadores recibida:", data);
                    setStore({tablaGoleadores: data});

                } catch (error) {
                    console.error("❌ Error en getTablaGoleadoresPorTorneo:", error);
                }
            },

            getTablaMenciones: async (modalidad , torneoId) => {
                try {
                    console.log("🎖️ Fetch tabla menciones...");
                    const response = await fetch(`${BACKEND_URL}/${modalidad}/statistics/top-mentions?tournamentId=${torneoId}`);
                    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

                    const data = await response.json();
                    console.log("✅ Tabla de menciones recibida:", data);
                    setStore({tablaMenciones: data});
                } catch (error) {
                    console.error("Error en getTablaMenciones:", error);
                }
            },

            getTablaMvps: async (modalidad, torneoId) => {
                try {
                    console.log("🏆 Fetch tabla MVPs...");
                    const response = await fetch(`${BACKEND_URL}/${modalidad}/statistics/top-mvps?tournamentId=${torneoId}`);
                    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

                    const data = await response.json();
                    console.log("✅ Tabla MVPs recibida:", data);
                    setStore({tablaMvps: data});
                } catch (error) {
                    console.error("Error en getTablaMvps:", error);
                }
            },

            getTorneos: async () => {
                try {
                    const response = await fetch(`${BACKEND_URL}/torneos`);
                    const data = await response.json();

                    if (response.ok) {
                        setStore({torneos: data});
                    } else {
                        console.error("Error al obtener los torneos:", data.message);
                    }
                } catch (error) {
                    console.error("Error en getTorneos:", error);
                }
            },

            getTorneosPorModalidad: async (modalidad) => {
                try {
                    console.log(`🔍 Fetch torneos para modalidad: ${modalidad}`);
                    const response = await fetch(`${BACKEND_URL}/${modalidad}/tournaments`);

                    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

                    const data = await response.json();
                    console.log("✅ Torneos recibidos:", data);
                    setStore({torneos: data});

                } catch (error) {
                    console.error("❌ Error en getTorneosPorModalidad:", error);
                }
            },

            login: async (email, password) => {
                try {
                    const response = await fetch(`${BACKEND_URL}/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        localStorage.setItem("token", data.token);
                        localStorage.setItem("jugadorId", data.id);
                        localStorage.setItem("nickHabbo", data.nickHabbo || "");

                        // 🔸 Guarda todos los roles como JSON string
                        localStorage.setItem("roles", JSON.stringify(data.roles));

                        setStore({
                            token: data.token,
                            jugadorId: data.id,
                            nickHabbo: data.nickHabbo,
                            roles: data.roles
                        });

                        return { success: true, message: "Inicio de sesión exitoso" };
                    } else {
                        return { success: false, message: data.message || "Credenciales incorrectas." };
                    }
                } catch (error) {
                    return { success: false, message: "Error de conexión con el servidor" };
                }
            },

            logout: () => {
                localStorage.clear(); // ✅ Borra todo lo almacenado

                setStore({token: null, role: null, jugadorId: null});

                // Redirigir al usuario al login
                setTimeout(() => {
                    window.location.replace("/login");
                }, 500);
            },

            obtenerAsistencias: async () => {
                try {
                    const token = localStorage.getItem("token"); // Obtener el token JWT
                    const response = await fetch(`${BACKEND_URL}/assistance`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            // Incluir el token
                        }
                    });

                    const data = await response.json();

                    if (response.ok) {
                        setStore({asistencias: data.reverse()});
                    } else {
                        console.error("Error al obtener asistencias:", data.message);
                    }
                } catch (error) {
                    console.error("Error al obtener asistencias:", error);
                }
            },

            obtenerEquiposPorModalidad: async (modalidad) => {
                try {
                    const resp = await fetch(`${BACKEND_URL}/${modalidad}/equipos`);
                    if (!resp.ok) throw new Error("Error al obtener los equipos");

                    const data = await resp.json();
                    setStore({equipos: data});
                } catch (error) {
                    console.error("Error:", error);
                }
            },

            obtenerNoticias: async (modalidad) => {
                try {
                    const response = await fetch(`${BACKEND_URL}/${modalidad}/news`);
                    if (!response.ok) throw new Error("Error al obtener noticias");
                    const data = await response.json();
                    setStore({noticias: data});
                } catch (error) {
                    console.error("Error al obtener noticias:", error);
                }
            },

            obtenerResumenes: async (modalidad, torneoId) => {
                try {
                    const response = await fetch(`${BACKEND_URL}/${modalidad}/matches?tournamentId=${torneoId}`);
                    if (!response.ok) throw new Error("Error al obtener los resúmenes");

                    const data = await response.json();
                    setStore({partidos: data});
                } catch (error) {
                    console.error("Error al obtener los resúmenes:", error);
                }
            },

            register: async (playerData) => {
                try {
                    // 1️⃣ Verificar campos vacíos
                    if (!playerData.name || !playerData.email || !playerData.password || !playerData.nickhabbo) {
                        return { success: false, message: "Todos los campos son obligatorios" };
                    }

                    // 2️⃣ Validar formato de email
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(playerData.email)) {
                        return { success: false, message: "El email no es válido" };
                    }

                    // 3️⃣ Validar contraseña: 8 caracteres, mayúscula, minúscula y número
                    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
                    if (!passwordRegex.test(playerData.password)) {
                        return {
                            success: false,
                            message: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número"
                        };
                    }

                    // 4️⃣ Enviar solicitud al backend
                    const response = await fetch(`${BACKEND_URL}/register`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name: playerData.name,
                            email: playerData.email,
                            password: playerData.password,
                            nickHabbo: playerData.nickhabbo
                        }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        console.error("Error en register:", data.error || data.message || data);
                        return {
                            success: false,
                            message: data.error || data.message || "Error desconocido"
                        };
                    }

                    return {
                        success: true,
                        message: data.message || "¡Registro exitoso!"
                    };

                } catch (error) {
                    console.error("Error en register:", error);
                    return {
                        success: false,
                        message: "Error de conexión con el servidor"
                    };
                }
            },

            registrarAsistencia: async (name) => {
                if (!name.trim()) {
                    return {success: false, message: "Debes ingresar un nombre"};
                }

                try {
                    const response = await fetch(`${BACKEND_URL}/assistance`, {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({name}),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        getActions().obtenerAsistencias(); // Refresca la lista
                        return {success: true, message: data.message || "Registrada correctamente"};
                    } else {
                        return {success: false, message: data.message || "No se pudo registrar la asistencia"};
                    }
                } catch (error) {
                    console.error("Error al registrar asistencia:", error);
                    return {success: false, message: "Error de conexión con el servidor"};
                }
            },

            registrarPartido: async (partidoData) => {
                try {
                    const response = await secureFetch(BACKEND_URL + "/partidos", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`,

                        },
                        body: JSON.stringify(partidoData),
                    });

                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || "Error al registrar el partido");

                    console.log("Partido registrado con éxito:", data);
                    return {success: true, message: "Partido registrado correctamente"};
                } catch (error) {
                    console.error("Error al registrar el partido:", error);
                    return {success: false, message: error.message};
                }
            },

            removePlayerFromTeam: async (playerId, teamId) => {
                try {
                    console.log("Intentando eliminar jugador del equipo:", {playerId, teamId}); // 🛠 Depuración

                    // 🔹 Obtener el token del usuario desde localStorage (o donde lo almacenes)
                    const token = localStorage.getItem("token");

                    if (!token) {
                        console.error("No tienes una sesión activa");
                        return {success: false, message: "No tienes una sesión activa"};
                    }

                    const response = await secureFetch(BACKEND_URL + "/remove_team", {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`  // ✅ Se agrega el token JWT
                        },
                        body: JSON.stringify({player_id: playerId, team_id: teamId})
                    });

                    if (!response.ok) throw new Error("Error al eliminar el jugador del equipo.");

                    const data = await response.json();
                    console.log("Jugador eliminado:", data); // 🛠 Depuración

                    getActions().getJugadores(); // Actualiza la lista de jugadores
                    return {success: true, data};
                } catch (error) {
                    console.error("Error al eliminar jugador del equipo:", error);
                    return {success: false, message: "Error al eliminar el jugador del equipo."};
                }
            },

            setTorneoSeleccionado: (torneo) => {
                console.log("📌 Torneo seleccionado:", torneo);
                setStore({torneoSeleccionado: torneo});
            },

            updatePlayerNick: async (playerId, newNick) => {
                try {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        return {success: false, message: "No estás autenticado"};
                    }

                    const response = await secureFetch(`${BACKEND_URL}/jugadores/${playerId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,

                        },
                        body: JSON.stringify({nickhabbo: newNick}),
                    });

                    const data = await response.json();
                    console.log("Respuesta del servidor:", data); // Depuración

                    if (!response.ok) {
                        console.error("Error en updatePlayerNick:", data.message);
                        return {success: false, message: data.message || "Error desconocido"};
                    }

                    return {success: true, message: "NickHabbo actualizado correctamente"};

                } catch (error) {
                    console.error("Error en updatePlayerNick:", error);
                    return {success: false, message: "Error de conexión con el servidor"};
                }
            },

            updatePlayerRole: async (playerId, newRole) => {
                try {
                    const token = localStorage.getItem("token");
                    const response = await fetch(`${BACKEND_URL}/jugadores/roles`, { // 🔥 URL corregida
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,

                        },
                        body: JSON.stringify({id: playerId, role: newRole}) // ✅ El backend espera un objeto con "id" y "role"
                    });

                    const result = await response.json();
                    if (!response.ok) throw new Error(result.error || "Error desconocido");

                    console.log("✅ Rol actualizado:", result);

                    getActions().getPlayersWithRoles(); // 🔄 Refrescar lista después de actualizar
                } catch (error) {
                    console.error("❌ Error al actualizar rol:", error);
                }
            },
        }
    };
};

export default getState;