import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext.jsx";
import { useParams } from "react-router-dom";
import "../styles/resumen.css";

const Resumenes = () => {
    const { store, actions } = useContext(Context);
    const { modalidad } = useParams();
    const modalidadUpper = modalidad ? modalidad.toUpperCase() : "";
    const [torneoSeleccionado, setTorneoSeleccionado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);

    useEffect(() => {
        actions.getTorneosPorModalidad(modalidadUpper);
    }, [modalidadUpper]);


    useEffect(() => {
        const cargarResumenes = async () => {
            if (torneoSeleccionado && torneoSeleccionado.id) {
                setLoading(true);
                console.log("📌 Torneo seleccionado:", torneoSeleccionado);

                await Promise.all([
                    actions.obtenerResumenes(modalidadUpper, torneoSeleccionado.id),
                    actions.getEquipos(modalidadUpper, torneoSeleccionado.id),
                    //actions.getJugadores(modalidadUpper, torneoSeleccionado.id)
                ]);
                setLoading(false);
            } else {
                console.warn("⚠️ No hay torneo seleccionado, no se pueden cargar las tablas.");
            }
        };

        cargarResumenes();
    }, [torneoSeleccionado]);

    const partidos = store.partidos || [];
    const jugadores = store.jugadores || [];
    const equipos = store.equipos || [];

    const jugadoresMap = jugadores.reduce((acc, jugador) => {
        acc[jugador.id] = jugador.nickhabbo;
        return acc;
    }, {});

    const equiposMap = equipos.reduce((acc, equipo) => {
        acc[equipo.id] = equipo.name;
        return acc;
    }, {});


    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Cargando partidos...</p>
            </div>
        );
    }

    return (
        <div className="resumenes-container">
            <h2 className="resumenes-title">Partidos de {modalidad?.toUpperCase()}</h2>
            {/* Selector de Torneo */}
            <select
                onChange={(e) => {
                    const torneo = store.torneos.find(t => t.id == e.target.value);
                    setTorneoSeleccionado(torneo);
                }}
                className="torneo-select-resumenes"
            >
                <option value="">Selecciona un Torneo</option>
                {store.torneos
                    .filter(t => t.modality.toUpperCase() === modalidadUpper)
                    .map(torneo => (
                        <option key={torneo.id} value={torneo.id}>{torneo.name}</option>
                    ))
                }
            </select>

            {loading ? (
                <div className="spinner-wrapper">
                    <div className="spinner"></div>
                    <p className="spinner-text">Cargando datos del torneo...</p>
                </div>
            ) : torneoSeleccionado ? (
                <>
                <div className="resumenes-list">
                    {partidos.length > 0 ? (
                        partidos.map((partido) => (
                            <div key={partido.id} className="resumen-card" onClick={() => setPartidoSeleccionado(partido)}>
                                <h4 className="resumen-equipos">
                                    {equiposMap[partido.teamAId] || "Desconocido"} 🆚 {equiposMap[partido.teamBId] || "Desconocido"}
                                </h4>
                                <p className="resumen-fecha">📅 {partido.date}</p>
                                <p className="resumen-resultado">{partido.goalsTeamA} - {partido.goalsTeamB}</p>
                            </div>
                        ))
                    ) : (
                        <p className="no-partidos">No hay partidos disponibles para esta modalidad.</p>
                    )}
                </div>
                </>
            ) : (
            <p>Selecciona un torneo para ver los resumenes.</p>
            )}

            {partidoSeleccionado && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h5 className="modal-title">Detalles del Partido</h5>
                            <button className="modal-close" onClick={() => setPartidoSeleccionado(null)}>✖</button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Equipos:</strong> {equiposMap[partidoSeleccionado.equipo_a_id]} 🆚 {equiposMap[partidoSeleccionado.equipo_b_id]}</p>
                            <p><strong>Resultado:</strong> {partidoSeleccionado.goles_equipo_a} - {partidoSeleccionado.goles_equipo_b}</p>
                            <p><strong>Fecha:</strong> {partidoSeleccionado.fecha}</p>
                            <p><strong>Estado:</strong> {partidoSeleccionado.estado}</p>
                            <p><strong>Juez:</strong> {partidoSeleccionado.juez}</p>
                            <p><strong>MVP:</strong> {jugadoresMap[partidoSeleccionado.mvp_id] || "No asignado"}</p>
                            <p><strong>Mención especial (Equipo A):</strong> {jugadoresMap[partidoSeleccionado.mencion_equipo_a_id] || "No asignado"}</p>
                            <p><strong>Mención especial (Equipo B):</strong> {jugadoresMap[partidoSeleccionado.mencion_equipo_b_id] || "No asignado"}</p>

                            <h5 className="stats-title">📊 Estadísticas individuales:</h5>
                            <div className="stats-container">
                                <div className="stats-team">
                                    <h6 className="team-winner">{equiposMap[partidoSeleccionado.equipo_a_id]}</h6>
                                    <ul>
                                        {partidoSeleccionado.estadisticas?.filter(est => est.equipo_id === partidoSeleccionado.equipo_a_id).map(est => (
                                            <li key={est.jugador_id}>
                                                {jugadoresMap[est.jugador_id]}: {est.goles} goles, {est.asistencias} asistencias, {est.autogoles} autogoles
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="stats-team">
                                    <h6 className="team-loser">{equiposMap[partidoSeleccionado.equipo_b_id]}</h6>
                                    <ul>
                                        {partidoSeleccionado.estadisticas?.filter(est => est.equipo_id === partidoSeleccionado.equipo_b_id).map(est => (
                                            <li key={est.jugador_id}>
                                                {jugadoresMap[est.jugador_id]}: {est.goles} goles, {est.asistencias} asistencias, {est.autogoles} autogoles
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* 🚀 Observaciones restauradas */}
                            <p className="resumen-observaciones">
                                <strong>📝 Observaciones:</strong> {partidoSeleccionado.observaciones || "Ninguna"}
                            </p>

                            {partidoSeleccionado.link_video && (
                                <p>
                                    <strong>🎥 Video del Partido: </strong>
                                    <a href={partidoSeleccionado.link_video} target="_blank" rel="noopener noreferrer">
                                        Ver aquí
                                    </a>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Resumenes;
