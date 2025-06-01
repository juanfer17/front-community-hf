import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/scrollToTop.jsx";
import { Navbar } from "./components/navbar.jsx";
import injectContext from "./store/appContext.jsx";

// Pages
import Register from "./pages/Register";
import Attendance from "./pages/Attendance";
import AdminDashboard from "./pages/AdminDashboard";
import AdminJugadores from "./pages/AdminJugadores";
import Hestable from "./pages/Hestable";
import AicDashboard from "./pages/AicDashboard";
import OhbDashboard from "./pages/OhbDashboard";
import RegistroPartido from "./pages/RegistroPartido";
import HFADashboard from "./pages/HfaDashboard";
import Equipos from "./pages/Equipos";
import CrearTorneo from "./pages/CrearTorneo";
import Roles from "./pages/Roles";
import Login from "./pages/Login";
import { Home } from "./pages/home.jsx";
import { Demo } from "./pages/demo.jsx";
import { Single } from "./pages/single.jsx";

// Components
import EquiposModalidad from "./components/EquiposModalidad";
import Rankings from "./components/Rankings";
import Noticias from "./components/Noticias";
import ResumenesPartidos from "./components/Resumenes";
import OfertarJugador from "./components/OfertarJugador";
import { BackendURL } from "./components/backendURL.jsx";

const App = () => {
    const basename = import.meta.env.VITE_BASENAME || "";

    if (!import.meta.env.VITE_BACKEND_URL) {
        return <BackendURL />;
    }

    return (
        <BrowserRouter basename={basename}>
            <ScrollToTop />
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/asistencia" element={<Attendance />} />
                <Route path="/arbitraje" element={<RegistroPartido />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/single/:theid" element={<Single />} />

                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/jugadores" element={<AdminJugadores />} />
                <Route path="/admin/torneos" element={<CrearTorneo />} />
                <Route path="/admin/equipos" element={<Equipos />} />
                <Route path="/admin/roles" element={<Roles />} />

                <Route path="/hes" element={<Hestable />} />
                <Route path="/aic" element={<AicDashboard />} />
                <Route path="/hfa" element={<HFADashboard />} />
                <Route path="/ohb" element={<OhbDashboard />} />

                <Route path="/noticias" element={<Noticias />} />
                <Route path="/:modalidad/equipos" element={<EquiposModalidad />} />
                <Route path="/:modalidad/rankings" element={<Rankings />} />
                <Route path="/:modalidad/resumenes" element={<ResumenesPartidos />} />
                <Route path="/:modalidad/convocatorias" element={<OfertarJugador />} />
                <Route path="/:modalidad/noticias" element={<Noticias />} />

                <Route path="*" element={<h1>Not found!</h1>} />
            </Routes>
        </BrowserRouter>
    );
};

export default injectContext(App);
