import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext.jsx";
import { useNavigate } from "react-router-dom";
import "../styles/partidos.css";

const RegistroPartido = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();


    const [torneoId, setTorneoId] = useState("");
    const [equipoAId, setEquipoAId] = useState("");
    const [equipoBId, setEquipoBId] = useState("");
    const [jugadoresEquipoA, setJugadoresEquipoA] = useState([]);
    const [jugadoresEquipoB, setJugadoresEquipoB] = useState([]);
    const [estadisticas, setEstadisticas] = useState({});
    const [juez, setJuez] = useState("");
    const [golesEquipoA, setGolesEquipoA] = useState(0);
    const [golesEquipoB, setGolesEquipoB] = useState(0);
    const [mvp, setMvp] = useState("");
    const [mencionA, setMencionA] = useState("");
    const [mencionB, setMencionB] = useState("");
    const [observaciones, setObservaciones] = useState("");
    const [linkVideo, setLinkVideo] = useState("");
    const [jugadoresSeleccionadosA, setJugadoresSeleccionadosA] = useState([]);
    const [jugadoresSeleccionadosB, setJugadoresSeleccionadosB] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");


    useEffect(() => {
        // Cargar roles desde localStorage
        const rolesJson = localStorage.getItem("roles");
        if (rolesJson) {
            try {
                const parsedRoles = JSON.parse(rolesJson);
                setRoles(parsedRoles);
            } catch (error) {
                console.error("Error al parsear roles:", error);
            }
        }

        // Cargar nickHabbo desde localStorage
        const nickHabbo = localStorage.getItem("nickHabbo");
        if (nickHabbo) {
            setJuez(nickHabbo);
        }
    }, []);

    // Obtener torneos cuando se selecciona una modalidad
    useEffect(() => {
        if (selectedRole) {
            // Buscar el nombre de la modalidad basado en el rol seleccionado
            const modalidadSeleccionada = roles.find(rol => rol.role === selectedRole)?.modalityName;
            if (modalidadSeleccionada) {
                actions.getTorneosPorModalidad(modalidadSeleccionada);
            }
        }
    }, [selectedRole, roles]);


    useEffect(() => {
        if (torneoId) {
            // Obtener la modalidad seleccionada
            const modalidadSeleccionada = roles.find(rol => rol.role === selectedRole)?.modalityName;
            if (modalidadSeleccionada) {
                actions.getEquipos(modalidadSeleccionada, torneoId);
            }
        }
    }, [torneoId, selectedRole, roles]);


    useEffect(() => {
        // Obtener la modalidad seleccionada
        const modalidadSeleccionada = roles.find(rol => rol.role === selectedRole)?.modalityName;

        // Reset player selections when teams change
        setJugadoresSeleccionadosA([]);
        setJugadoresSeleccionadosB([]);

        console.log("Team selection changed, resetting player selections");

        if (equipoAId && modalidadSeleccionada) {
            actions.getJugadoresPorEquipo(equipoAId, modalidadSeleccionada).then((data) => {
                console.log("Jugadores de equipo A:", data); // Agregar este log
                setJugadoresEquipoA(data || []);
            });
        } else {
            setJugadoresEquipoA([]);
        }

        if (equipoBId && modalidadSeleccionada) {
            actions.getJugadoresPorEquipo(equipoBId, modalidadSeleccionada).then((data) => {
                console.log("Jugadores de equipo B:", data); // Agregar este log
                setJugadoresEquipoB(data || []);
            });
        } else {
            setJugadoresEquipoB([]);
        }
    }, [equipoAId, equipoBId, selectedRole, roles]);


    // Manejar cambios en estadísticas (sin cambios)
    const handleStatChange = (jugadorId, stat, value) => {
        setEstadisticas({
            ...estadisticas,
            [jugadorId]: {
                ...estadisticas[jugadorId],
                [stat]: Number(value) || 0
            },
        });
    };

    const toggleSeleccionJugador = (jugadorId, equipo) => {
        console.log(`Toggling player ${jugadorId} for team ${equipo}`);

        if (equipo === "A") {
            console.log(`Current Team A selections: ${JSON.stringify(jugadoresSeleccionadosA)}`);

            // Crear una copia del array actual
            const seleccionActual = [...jugadoresSeleccionadosA];

            // Si el jugador ya está seleccionado, lo quitamos
            if (seleccionActual.includes(jugadorId)) {
                console.log(`Removing player ${jugadorId} from Team A selections`);
                const index = seleccionActual.indexOf(jugadorId);
                if (index !== -1) {
                    seleccionActual.splice(index, 1);
                }
            } else {
                // Si no está seleccionado, lo agregamos a la lista
                console.log(`Adding player ${jugadorId} to Team A selections`);
                seleccionActual.push(jugadorId);
            }

            // Actualizamos el estado con la nueva selección
            console.log(`New Team A selections: ${JSON.stringify(seleccionActual)}`);
            setJugadoresSeleccionadosA(seleccionActual);
        } else {
            console.log(`Current Team B selections: ${JSON.stringify(jugadoresSeleccionadosB)}`);

            // Crear una copia del array actual
            const seleccionActual = [...jugadoresSeleccionadosB];

            // Si el jugador ya está seleccionado, lo quitamos
            if (seleccionActual.includes(jugadorId)) {
                console.log(`Removing player ${jugadorId} from Team B selections`);
                const index = seleccionActual.indexOf(jugadorId);
                if (index !== -1) {
                    seleccionActual.splice(index, 1);
                }
            } else {
                // Si no está seleccionado, lo agregamos a la lista
                console.log(`Adding player ${jugadorId} to Team B selections`);
                seleccionActual.push(jugadorId);
            }

            // Actualizamos el estado con la nueva selección
            console.log(`New Team B selections: ${JSON.stringify(seleccionActual)}`);
            setJugadoresSeleccionadosB(seleccionActual);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Obtener la modalidad seleccionada
        const modalidadSeleccionada = roles.find(rol => rol.role === selectedRole)?.modalityName;
        if (!modalidadSeleccionada) {
            alert("❌ Debes seleccionar una modalidad.");
            return;
        }

        // Crear el DTO según la estructura requerida por el backend
        const partidoData = {
            tournamentId: Number(torneoId) || 0,
            teamAId: Number(equipoAId) || 0,
            teamBId: Number(equipoBId) || 0,
            referee: juez.trim() || "Desconocido",
            goalsTeamA: Number(golesEquipoA) || 0,
            goalsTeamB: Number(golesEquipoB) || 0,
            mvpId: Number(mvp) || 0,
            mentionTeamAId: Number(mencionA) || 0,
            mentionTeamBId: Number(mencionB) || 0,
            videoLink: linkVideo.startsWith("http") ? linkVideo.trim() : null,
            observations: observaciones.trim() || "Sin observaciones",
        };

        console.log("📤 Enviando datos al backend:", JSON.stringify(partidoData, null, 2));

        if (!torneoId || !equipoAId || !equipoBId || !juez || !mvp || !mencionA || !mencionB) {
            alert("❌ Todos los campos son obligatorios.");
            return;
        }

        const resultado = await actions.registrarPartido(modalidadSeleccionada, partidoData);
        if (resultado.success) {
            alert("✅ Partido registrado con éxito");
            navigate("/"); // Redireccionar al home después de un registro exitoso
        } else {
            alert(`${resultado.message}`);
        }
    };

    return (
        <div className="registro-partido">
            <form onSubmit={handleSubmit}>
                {/* Primera fila: Modalidad, Torneo, Nombre Juez */}
                <div className="form-row">
                    <div className="registro-form-section">
                        <label>Modalidad:</label>
                        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                            <option value="">Seleccionar Rol</option>
                            {roles.filter(rol => rol.role === "ARBITRO").map((rol, index) => (
                                <option key={index} value={rol.role}>{rol.modalityName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="registro-form-section">
                        <label className="registro-label">Torneo:</label>
                        <select className="registro-select" value={torneoId} onChange={(e) => setTorneoId(e.target.value)} required>
                            <option value="">Seleccionar Torneo</option>
                            {store.torneos.map((torneo) => (
                                <option key={torneo.id} value={torneo.id}>{torneo.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="registro-form-section">
                        <label>Nombre del Juez:</label>
                        <input type="text" value={juez} readOnly required />
                    </div>
                </div>

                {/* Segunda fila: Equipo A y goles equipo A */}
                <div className="form-row">
                    <div className="form-section">
                        <label className="registro-equiposA">Equipo A:</label>
                        <select value={equipoAId} onChange={(e) => setEquipoAId(e.target.value)} required>
                            <option value="">Seleccionar Equipo A</option>
                            {store.equipos
                                .filter(equipo => equipo.id !== equipoBId) // Filtrar el equipo seleccionado en B
                                .map((equipo) => (
                                    <option key={equipo.id} value={equipo.id}>{equipo.name}</option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="form-section">
                        <label>Goles Equipo A:</label>
                        <input type="number" min="0" value={golesEquipoA} onChange={(e) => setGolesEquipoA(e.target.value)} required />
                    </div>
                </div>

                {/* Tercera fila: Equipo B y goles equipo B */}
                <div className="form-row">
                    <div className="form-section">
                        <label className="registro-equiposB">Equipo B:</label>
                        <select value={equipoBId} onChange={(e) => setEquipoBId(e.target.value)} required>
                            <option value="">Seleccionar Equipo B</option>
                            {store.equipos
                                .filter(equipo => equipo.id !== equipoAId) // Filtrar el equipo seleccionado en A
                                .map((equipo) => (
                                    <option key={equipo.id} value={equipo.id}>{equipo.name}</option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="form-section">
                        <label>Goles Equipo B:</label>
                        <input type="number" min="0" value={golesEquipoB} onChange={(e) => setGolesEquipoB(e.target.value)} required />
                    </div>
                </div>

                <h3 className="titulo-estadistica">Estadísticas</h3>

                {/* Selección de jugadores para el Equipo A */}
                <div className="jugadores-seleccion-container">
                    <h4>Seleccionar jugadores de Equipo A:</h4>
                    <div className="jugadores-seleccion">
                        {jugadoresEquipoA.map((jugador) => {
                            const isChecked = jugadoresSeleccionadosA.includes(jugador.playerId);
                            return (
                                <label key={`team-a-${jugador.playerId}`} className="jugador-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {
                                            console.log(`Checkbox clicked for player ${jugador.playerId} (Team A), current state: ${isChecked}`);
                                            toggleSeleccionJugador(jugador.playerId, "A");
                                        }}
                                    />
                                    <span className="jugador-nombre">{jugador.nickHabbo}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Selección de jugadores para el Equipo B */}
                <div className="jugadores-seleccion-container">
                    <h4>Seleccionar jugadores de Equipo B:</h4>
                    <div className="jugadores-seleccion">
                        {jugadoresEquipoB.map((jugador) => {
                            const isChecked = jugadoresSeleccionadosB.includes(jugador.playerId);
                            return (
                                <label key={`team-b-${jugador.playerId}`} className="jugador-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {
                                            console.log(`Checkbox clicked for player ${jugador.playerId} (Team B), current state: ${isChecked}`);
                                            toggleSeleccionJugador(jugador.playerId, "B");
                                        }}
                                    />
                                    <span className="jugador-nombre">{jugador.nickHabbo}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Tercera fila: Estadísticas de jugadores seleccionados */}
                <div className="registro-jugadores-container">

                    {/* Jugadores seleccionados equipo A */}
                    <div className="registro-form-section">
                        <h3>Jugadores Equipo A</h3>
                        {jugadoresEquipoA
                            .filter(jugador => jugadoresSeleccionadosA.includes(jugador.playerId))
                            .map((jugador) => (
                                <div key={jugador.playerId} className="jugador">
                                    <span>{jugador.nickHabbo}</span>
                                    <div className="estadisticas-inputs">
                                        <div className="input-group">
                                            <label>Goles</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={estadisticas[jugador.playerId]?.goles || 0}
                                                onChange={(e) => handleStatChange(jugador.playerId, "goles", e.target.value)}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Asistencias</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={estadisticas[jugador.playerId]?.asistencias || 0}
                                                onChange={(e) => handleStatChange(jugador.playerId, "asistencias", e.target.value)}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Autogoles</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={estadisticas[jugador.playerId]?.autogoles || 0}
                                                onChange={(e) => handleStatChange(jugador.playerId, "autogoles", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {/* Jugadores seleccionados equipo B */}
                    <div className="registro-form-section">
                        <h3>Jugadores Equipo B</h3>
                        {jugadoresEquipoB
                            .filter(jugador => jugadoresSeleccionadosB.includes(jugador.playerId))
                            .map((jugador) => (
                                <div key={jugador.playerId} className="jugador">
                                    <span>{jugador.nickHabbo}</span>
                                    <div className="estadisticas-inputs">
                                        <div className="input-group">
                                            <label>Goles</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={estadisticas[jugador.playerId]?.goles || 0}
                                                onChange={(e) => handleStatChange(jugador.playerId, "goles", e.target.value)}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Asistencias</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={estadisticas[jugador.playerId]?.asistencias || 0}
                                                onChange={(e) => handleStatChange(jugador.playerId, "asistencias", e.target.value)}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Autogoles</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={estadisticas[jugador.playerId]?.autogoles || 0}
                                                onChange={(e) => handleStatChange(jugador.playerId, "autogoles", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>

                </div>


                {/* Cuarta fila: MVP, Menciones, Observaciones, Link de Video */}
                <div className="form-section">
                    <label>MVP:</label>
                    <select value={mvp} onChange={(e) => setMvp(e.target.value)} required>
                        <option value="">Seleccionar MVP</option>
                        {[...jugadoresEquipoA, ...jugadoresEquipoB].map((jugador) => (
                            <option key={jugador.playerId} value={jugador.playerId}>{jugador.nickHabbo}</option>
                        ))}
                    </select>
                </div>

                <div className="form-section">
                    <label>Mención A:</label>
                    <select value={mencionA} onChange={(e) => setMencionA(e.target.value)} required>
                        <option value="">Seleccionar Jugador del Equipo A</option>
                        {jugadoresEquipoA
                            .filter(jugador => jugador.playerId !== Number(mvp)) // Filtrar el MVP
                            .map((jugador) => (
                                <option key={jugador.playerId} value={jugador.playerId}>{jugador.nickHabbo}</option>
                            ))
                        }
                    </select>
                </div>

                <div className="form-section">
                    <label>Mención B:</label>
                    <select value={mencionB} onChange={(e) => setMencionB(e.target.value)} required>
                        <option value="">Seleccionar Jugador del Equipo B</option>
                        {jugadoresEquipoB
                            .filter(jugador => jugador.playerId !== Number(mvp)) // Filtrar el MVP
                            .map((jugador) => (
                                <option key={jugador.playerId} value={jugador.playerId}>{jugador.nickHabbo}</option>
                            ))
                        }
                    </select>
                </div>

                <div className="form-section">
                    <label>Observaciones:</label>
                    <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
                </div>

                <div className="form-section">
                    <label>Enlace (Opcional):</label>
                    <input type="text" value={linkVideo} onChange={(e) => setLinkVideo(e.target.value)} />
                </div>

                {/* Botón de enviar */}
                <button type="submit" className="registro-button" disabled={selectedRole !== "ARBITRO"}>Registrar Partido</button>
            </form>
        </div>
    );
};

export default RegistroPartido;
