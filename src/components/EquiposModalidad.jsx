import React, { useEffect, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { Context } from "../store/appContext.jsx";
import "../styles/equiposmodalidad.css";

const EquiposModalidad = () => {
    const { store, actions } = useContext(Context);
    const { modalidad } = useParams();
    const modalidadNormalizada = modalidad.toUpperCase();
    const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
    const [jugadores, setJugadores] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (store.equipos.length === 0) {
            actions.getEquiposConLogo(modalidadNormalizada);
        }
    }, [store.equipos]);

    const modalidadLower = modalidad ? modalidad.toLowerCase() : "";

    const equiposFiltrados = store.equipos
        ? store.equipos.filter(equipo => equipo.tournamentModality && equipo.tournamentModality.toLowerCase() === modalidadLower)
        : [];

    const handleClickEquipo = async (equipoId) => {
        setEquipoSeleccionado(equipoId);
        const jugadoresData = await actions.getJugadoresPorEquipo(equipoId, modalidad);
        setJugadores(jugadoresData);
        setShowModal(true);
    };
    return (
        <div className="equipos-container">
            <h1 className="titulo">Equipos de la modalidad {modalidad}</h1>
            <ul className="equipos-lista">
                {equiposFiltrados.map(equipo => (
                    <li
                        key={equipo.id}
                        className="equipo"
                        onClick={() => handleClickEquipo(equipo.id)}
                    >
                        {equipo.logoUrl && (
                            <img src={equipo.logoUrl} alt={`${equipo.name} logo`} className="equipo-logo" />
                        )}
                        {equipo.name}
                    </li>
                ))}
            </ul>

            {/* MODAL CORREGIDO */}
            {showModal && (
                <div className="modal modal-equipos show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title text-white">Jugadores del equipo</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <ul className="jugadores-lista">
                                    {jugadores.length > 0 ? (
                                        jugadores.map(jugador => (
                                            <li key={jugador.id}>{jugador.nickHabbo}</li>
                                        ))
                                    ) : (
                                        <p>No hay jugadores en este equipo.</p>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquiposModalidad;
