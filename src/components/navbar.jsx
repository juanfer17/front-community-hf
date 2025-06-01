import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Context } from "../store/appContext.jsx";
import { User, Newspaper, LogOut, LogIn, UserPlus, Shield } from "lucide-react";
import "../styles/navbar.css";
import logohf from "../img/logohf.gif";

export const Navbar = () => {
  const { store, actions } = useContext(Context);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Extraer modalidad del primer segmento de la URL (ej. "/hfa/...")
  const modalidad = location.pathname.split("/")[1];
  const modalidadUpper = modalidad ? modalidad.toUpperCase() : "";

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
          menuRef.current &&
          !menuRef.current.contains(event.target) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
      <nav className="navbar">
        <a href="/">
          <img src={logohf} alt="Habbofutbol" className="navbar-logo" />
        </a>

        {modalidad && (
            <button
                className="noticias-boton"
                onClick={() => navigate(`/${modalidad}/noticias`)}
            >
              <Newspaper size={20} /> <span>Noticias</span>
            </button>
        )}

        <button className="menu-btn" ref={buttonRef} onClick={toggleMenu}>
          ⋮
        </button>

        {isOpen && (
            <div className="dropdown-menu" ref={menuRef}>
              {store.token ? (
                  <>
                    {(store.role === "admin" || store.role === "superadmin") && (
                        <div className="menu-item" onClick={() => navigate("/admin")}>
                          <Shield size={18} /> <span>Administración</span>
                        </div>
                    )}
                    <div className="menu-item" onClick={() => navigate("/perfil")}>
                      <User size={18} /> <span>Perfil</span>
                    </div>
                    <div
                        className="menu-item logout"
                        onClick={() => {
                          actions.logout();
                          navigate("/");
                        }}
                    >
                      <LogOut size={18} /> <span>Cerrar sesión</span>
                    </div>
                  </>
              ) : (
                  <>
                    <div className="menu-item" onClick={() => navigate("/login")}>
                      <LogIn size={18} /> <span>Iniciar sesión</span>
                    </div>
                    <div className="menu-item" onClick={() => navigate("/register")}>
                      <UserPlus size={18} /> <span>Registrarse</span>
                    </div>
                  </>
              )}
            </div>
        )}
      </nav>
  );
};
