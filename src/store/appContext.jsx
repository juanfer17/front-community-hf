import React, { useState, useEffect } from "react";
import getState from "./flux.jsx";

export const Context = React.createContext(null);

const injectContext = PassedComponent => {
	const StoreWrapper = props => {
		// Creamos un estado local para loading
		const [loading, setLoading] = useState(true);

		// Estado inicial para el store
		const initialState = getState({
			getStore: () => store.store,
			getActions: () => store.actions,
			setStore: updatedStore => setStore(prev => ({ store: { ...prev.store, ...updatedStore }, actions: { ...prev.actions } })),
		});

		const [store, setStore] = useState(initialState);

		// useEffect para cargar el localStorage solo una vez al montar
		useEffect(() => {
			const token = localStorage.getItem("token");
			const jugadorId = localStorage.getItem("jugadorId");
			const nickHabbo = localStorage.getItem("nickHabbo");
			const roles = JSON.parse(localStorage.getItem("roles") || "[]");

			if (token) {
				setStore(prev => ({
					...prev,
					store: {
						...prev.store,
						token,
						jugadorId,
						nickHabbo,
						roles
					}
				}));
			}
			setLoading(false);
		}, []);

		if (loading) {
			return <div>Cargando...</div>; // Mejor un spinner real si quieres UX más limpia
		}

		return (
			<Context.Provider value={store}>
				<PassedComponent {...props} />
			</Context.Provider>
		);
	};

	return StoreWrapper;
};

export default injectContext;