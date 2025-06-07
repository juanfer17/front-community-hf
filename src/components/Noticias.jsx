import React, { useContext, useState, useEffect, useRef } from "react";
import { Context } from "../store/appContext.jsx";
import "../styles/noticias.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useParams } from "react-router-dom";

const Noticias = () => {
    const { store, actions } = useContext(Context);
    const [nuevaNoticia, setNuevaNoticia] = useState({ titulo: "", contenido: "" });
    const [noticiaEditar, setNoticiaEditar] = useState(null);
    const [noticiaVer, setNoticiaVer] = useState(null);
    const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    const [mostrarModalVer, setMostrarModalVer] = useState(false);
    const { modalidad } = useParams();
    const modalidadUpper = modalidad ? modalidad.toUpperCase() : "";
    const quillRef = useRef(null);
    const quillEditRef = useRef(null);
    const [initDone, setInitDone] = useState(false);

    // Add a direct DOM manipulation script to ensure the editor is visible
    useEffect(() => {
        // Create a style element
        const style = document.createElement('style');
        style.textContent = `
            .ql-editor {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                min-height: 300px !important;
                background-color: white !important;
                color: #1e293b !important;
                padding: 15px !important;
                font-size: 16px !important;
                line-height: 1.6 !important;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                position: relative !important;
                z-index: 10 !important;
            }

            .ql-container {
                display: block !important;
                visibility: visible !important;
                min-height: 350px !important;
                max-height: 500px !important;
                opacity: 1 !important;
                z-index: 100 !important;
                background-color: white !important;
                border: 1px solid #3b82f6 !important;
                position: relative !important;
            }

            .ql-toolbar {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                z-index: 101 !important;
                background-color: #f8fafc !important;
                border-bottom: 2px solid #3b82f6 !important;
                position: relative !important;
            }

            .quill-visible {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                position: relative !important;
                z-index: auto !important;
            }

            .modal-carta.crear {
                display: flex !important;
                flex-direction: column !important;
                visibility: visible !important;
                opacity: 1 !important;
                z-index: 1001 !important;
            }
        `;
        document.head.appendChild(style);

        // Clean up function
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const tieneRolPermitido = () => {
        // Solo SUPERADMIN y ADMIN pueden crear noticias
        const rolesPermitidos = ["ADMIN", "SUPERADMIN"];
        const rolesJson = localStorage.getItem("roles");
        if (!rolesJson) return false;
        try {
            const roles = JSON.parse(rolesJson);
            return roles.some(roleObj => rolesPermitidos.includes(roleObj.role.toUpperCase()));
        } catch (error) {
            console.error("Error al parsear roles:", error);
            return false;
        }
    };

    useEffect(() => {
        actions.obtenerNoticias(modalidadUpper);
    }, [modalidadUpper]);

    useEffect(() => {
        console.log("Modal crear:", mostrarModalCrear, "quillRef:", !!quillRef.current, "initDone:", initDone);

        // Only initialize if modal is shown and editor ref exists
        if (mostrarModalCrear && quillRef.current) {
            setInitDone(true);
            console.log("Initializing editor...");

            // Enhanced initialization with multiple attempts and better error handling
            const initializeEditor = () => {
                try {
                    if (!quillRef.current) {
                        console.warn("quillRef is no longer available");
                        return;
                    }

                    const editor = quillRef.current.getEditor();
                    console.log("Editor object:", editor);

                    if (!editor) {
                        console.warn("Editor not created properly");
                        return;
                    }

                    // Apply direct styles to ensure visibility
                    const container = editor.root?.parentNode;
                    if (container) {
                        console.log("Setting editor container styles for visibility");
                        container.style.display = "block";
                        container.style.visibility = "visible";
                        container.style.minHeight = "350px";
                        container.style.maxHeight = "500px";
                        container.style.opacity = "1";
                        container.style.zIndex = "100";
                        container.style.backgroundColor = "white";
                    }

                    const toolbar = container?.previousSibling;
                    if (toolbar && toolbar.classList.contains("ql-toolbar")) {
                        console.log("Setting toolbar styles for visibility");
                        toolbar.style.display = "block";
                        toolbar.style.visibility = "visible";
                        toolbar.style.opacity = "1";
                        toolbar.style.zIndex = "101";
                    }

                    // Force focus on the editor
                    try {
                        editor.focus();
                        console.log("Editor focused successfully");

                        // Enable keyboard input explicitly
                        editor.enable();
                    } catch (focusError) {
                        console.warn("Could not focus editor:", focusError);
                    }

                    console.log("Editor initialized successfully");
                } catch (error) {
                    console.error("Error initializing editor:", error);
                }
            };

            // First attempt immediately
            initializeEditor();

            // Second attempt after a short delay
            setTimeout(initializeEditor, 100);

            // Third attempt after a longer delay
            setTimeout(initializeEditor, 300);
        }

        return () => setInitDone(false);
    }, [mostrarModalCrear]);

    // Add a similar effect for the edit modal
    useEffect(() => {
        console.log("Modal editar:", mostrarModalEditar, "quillEditRef:", !!quillEditRef.current);

        // Only initialize if edit modal is shown and editor ref exists
        if (mostrarModalEditar && quillEditRef.current) {
            console.log("Initializing edit editor...");

            // Enhanced initialization with multiple attempts and better error handling
            const initializeEditEditor = () => {
                try {
                    if (!quillEditRef.current) {
                        console.warn("quillEditRef is no longer available");
                        return;
                    }

                    const editor = quillEditRef.current.getEditor();
                    console.log("Edit editor object:", editor);

                    if (!editor) {
                        console.warn("Edit editor not created properly");
                        return;
                    }

                    // Apply direct styles to ensure visibility
                    const container = editor.root?.parentNode;
                    if (container) {
                        console.log("Setting edit editor container styles for visibility");
                        container.style.display = "block";
                        container.style.visibility = "visible";
                        container.style.minHeight = "350px";
                        container.style.maxHeight = "500px";
                        container.style.opacity = "1";
                        container.style.zIndex = "100";
                        container.style.backgroundColor = "white";
                    }

                    const toolbar = container?.previousSibling;
                    if (toolbar && toolbar.classList.contains("ql-toolbar")) {
                        console.log("Setting edit toolbar styles for visibility");
                        toolbar.style.display = "block";
                        toolbar.style.visibility = "visible";
                        toolbar.style.opacity = "1";
                        toolbar.style.zIndex = "101";
                    }

                    // Force focus on the editor
                    try {
                        editor.focus();
                        console.log("Edit editor focused successfully");

                        // Enable keyboard input explicitly
                        editor.enable();
                    } catch (focusError) {
                        console.warn("Could not focus edit editor:", focusError);
                    }

                    console.log("Edit editor initialized successfully");
                } catch (error) {
                    console.error("Error initializing edit editor:", error);
                }
            };

            // First attempt immediately
            initializeEditEditor();

            // Second attempt after a short delay
            setTimeout(initializeEditEditor, 100);

            // Third attempt after a longer delay
            setTimeout(initializeEditEditor, 300);
        }
    }, [mostrarModalEditar]);

    const handleChange = (e) => {
        setNuevaNoticia(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };


    const imageHandler = () => {
        console.log("Image handler called");
        // Store the current active element to restore focus later
        const activeElement = document.activeElement;

        try {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();

            input.onchange = () => {
                try {
                    const file = input.files[0];
                    if (!file) {
                        console.log("No file selected");
                        return;
                    }

                    console.log("File selected:", file.name, file.type, file.size);
                    const reader = new FileReader();

                    reader.onload = () => {
                        try {
                            console.log("File loaded successfully");

                            // Determine which editor is active based on which modal is open
                            let currentRef = null;
                            if (mostrarModalCrear && quillRef.current) {
                                currentRef = quillRef;
                                console.log("Using create editor");
                            } else if (mostrarModalEditar && quillEditRef.current) {
                                currentRef = quillEditRef;
                                console.log("Using edit editor");
                            } else {
                                console.warn("No active editor found");
                                return;
                            }

                            if (!currentRef.current) {
                                console.warn("Editor reference is null");
                                return;
                            }

                            let editor;
                            try {
                                editor = currentRef.current.getEditor();
                                console.log("Got editor instance:", editor);

                                if (!editor.root || !document.contains(editor.root)) {
                                    console.warn("Editor root not found in document");

                                    // Try to make the editor visible and focused
                                    const container = document.querySelector('.modal-carta.crear .ql-container');
                                    if (container) {
                                        console.log("Found container via querySelector, applying styles");
                                        container.style.display = "block";
                                        container.style.visibility = "visible";
                                        container.style.opacity = "1";
                                    }

                                    return;
                                }

                                // Focus the editor before inserting the image
                                editor.focus();
                                console.log("Editor focused before inserting image");
                            } catch (e) {
                                console.error("Error al obtener el editor:", e);
                                return;
                            }

                            try {
                                const range = editor.getSelection(true);
                                console.log("Selected range:", range);

                                try {
                                    console.log("Inserting image at index:", range.index);
                                    editor.insertEmbed(range.index, 'image', reader.result);
                                    editor.setSelection(range.index + 1, 0);
                                    console.log("Image inserted successfully");
                                } catch (insertError) {
                                    console.error("Error inserting image:", insertError);
                                }
                            } catch (rangeError) {
                                console.error("Error getting selection range:", rangeError);
                                // Fallback: insert at the end of the document
                                try {
                                    const length = editor.getLength();
                                    console.log("Fallback: inserting at end of document, length:", length);
                                    editor.insertEmbed(length - 1, 'image', reader.result);
                                    editor.setSelection(length, 0);
                                } catch (fallbackError) {
                                    console.error("Fallback insertion failed:", fallbackError);
                                }
                            }

                            // Restore focus to the editor after a short delay
                            setTimeout(() => {
                                try {
                                    if (editor) {
                                        editor.focus();
                                        console.log("Editor refocused after image insertion");
                                    } else if (activeElement && document.contains(activeElement)) {
                                        activeElement.focus();
                                        console.log("Active element refocused after image insertion");
                                    }
                                } catch (focusError) {
                                    console.error("Error refocusing after image insertion:", focusError);
                                }
                            }, 100);
                        } catch (onloadError) {
                            console.error("Error in reader.onload:", onloadError);
                        }
                    };

                    reader.onerror = (error) => {
                        console.error("Error reading file:", error);
                    };

                    reader.readAsDataURL(file);
                } catch (onchangeError) {
                    console.error("Error in input.onchange:", onchangeError);
                }
            };
        } catch (error) {
            console.error("Error in imageHandler:", error);
        }
    };

    const handleCrearNoticia = async () => {
        if (!tieneRolPermitido()) {
            alert("No tienes permisos para crear noticias");
            return;
        }

        const newsRequest = {
            title: nuevaNoticia.titulo,
            content: nuevaNoticia.contenido,
            modality: modalidadUpper || null
        };

        const response = await actions.crearNoticia(newsRequest);
        if (response.success) {
            alert("Noticia creada con éxito");
            setNuevaNoticia({ titulo: "", contenido: "" });
            setMostrarModalCrear(false);
            actions.obtenerNoticias(modalidadUpper);
        } else {
            alert(`Error al crear noticia: ${response.message}`);
        }
    };

    const handleEditarNoticia = async () => {
        if (!tieneRolPermitido()) {
            alert("No tienes permisos para editar noticias");
            return;
        }

        const newsRequest = {
            title: noticiaEditar.titulo,
            content: noticiaEditar.contenido,
            modality: modalidadUpper || null
        };

        const response = await actions.editarNoticia(noticiaEditar.id, newsRequest);
        if (response.success) {
            alert("Noticia editada con éxito");
            setNoticiaEditar(null);
            setMostrarModalEditar(false);
            actions.obtenerNoticias(modalidadUpper);
        } else {
            alert(`Error al editar noticia: ${response.message}`);
        }
    };

    const handleEliminarNoticia = async (id) => {
        if (!tieneRolPermitido()) {
            alert("No tienes permisos para eliminar noticias");
            return;
        }

        if (window.confirm("¿Estás seguro de que deseas eliminar esta noticia?")) {
            const response = await actions.eliminarNoticia(id, modalidadUpper);
            if (response.success) {
                alert("Noticia eliminada con éxito");
                actions.obtenerNoticias(modalidadUpper);
            } else {
                alert(`Error al eliminar noticia: ${response.message}`);
            }
        }
    };

    return (
        <div className="noticias-wrapper">
            <div className="noticias-container">
                <h2 className="noticias-titulo">📰 Últimas Noticias</h2>

                {tieneRolPermitido() && (
                    <button className="btn-crear-noticia" onClick={() => setMostrarModalCrear(true)}>+ Crear Noticia</button>
                )}

                <div className="noticias-grid">
                    {store?.noticias?.length > 0 ? (
                        store.noticias.map((noticia) => (
                            <div 
                                key={noticia.id} 
                                className="noticia-preview-card"
                                onClick={() => {
                                    setNoticiaVer(noticia);
                                    setMostrarModalVer(true);
                                    console.log("Viendo noticia:", noticia);
                                }}
                            >
                                <h4>{noticia.title}</h4>
                                {tieneRolPermitido() && (
                                    <div className="noticia-actions">
                                        <button 
                                            className="btn-editar" 
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent triggering the parent's onClick
                                                setNoticiaEditar({
                                                    id: noticia.id,
                                                    titulo: noticia.title,
                                                    contenido: noticia.content
                                                });
                                                setMostrarModalEditar(true);
                                                console.log("Editando noticia:", noticia);
                                            }}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            className="btn-eliminar" 
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent triggering the parent's onClick
                                                handleEliminarNoticia(noticia.id);
                                            }}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No hay noticias disponibles.</p>
                    )}
                </div>

                {mostrarModalCrear && (
                    <div className="modal-overlay" onClick={(e) => e.preventDefault()}>
                        <div className="modal-carta crear" onClick={(e) => e.stopPropagation()}>
                            <span className="modal-cerrar" onClick={() => setMostrarModalCrear(false)}>&times;</span>
                            <h3>Nueva Noticia</h3>
                            <input
                                type="text"
                                name="titulo"
                                placeholder="Título"
                                value={nuevaNoticia.titulo}
                                onChange={handleChange}
                            />

                            <ReactQuill
                                key={`editor-create-${mostrarModalCrear}-${Date.now()}`}
                                ref={quillRef}
                                className="editor-noticia quill-visible"
                                theme="snow"
                                value={nuevaNoticia.contenido}
                                onChange={(value) => setNuevaNoticia(prev => ({ ...prev, contenido: value }))}
                                modules={{
                                    toolbar: {
                                        container: [
                                            [{ header: [1, 2, 3, false] }],
                                            ["bold", "italic", "underline", "strike"],
                                            [{ color: [] }, { background: [] }],
                                            [{ list: "ordered" }, { list: "bullet" }],
                                            [{ align: [] }],
                                            ["blockquote", "code-block"],
                                            ["link", "image"],
                                            ["clean"]
                                        ],
                                        handlers: {
                                            image: imageHandler
                                        }
                                    },
                                    clipboard: {
                                        matchVisual: false
                                    },
                                    history: {
                                        delay: 1000,
                                        maxStack: 100,
                                        userOnly: true
                                    },
                                    keyboard: {
                                        bindings: {}
                                    }
                                }}
                                bounds=".modal-carta.crear"
                                scrollingContainer=".modal-carta.crear"
                                preserveWhitespace={true}
                                placeholder="Escribe el contenido de tu noticia aquí... Para insertar imágenes, haz clic en el botón de imagen (📷) en la barra de herramientas y selecciona una imagen de tu dispositivo"
                            />

                            <button onClick={handleCrearNoticia}>Publicar</button>
                        </div>
                    </div>
                )}

                {mostrarModalEditar && noticiaEditar && (
                    <div className="modal-overlay" onClick={(e) => e.preventDefault()}>
                        <div className="modal-carta crear" onClick={(e) => e.stopPropagation()}>
                            <span className="modal-cerrar" onClick={() => setMostrarModalEditar(false)}>&times;</span>
                            <h3>Editar Noticia</h3>
                            <input
                                type="text"
                                name="titulo"
                                placeholder="Título"
                                value={noticiaEditar.titulo}
                                onChange={(e) => setNoticiaEditar(prev => ({ ...prev, titulo: e.target.value }))}
                            />

                            <ReactQuill
                                key={`editor-edit-${mostrarModalEditar}-${Date.now()}`}
                                ref={quillEditRef}
                                className="editor-noticia quill-visible"
                                theme="snow"
                                value={noticiaEditar.contenido}
                                onChange={(value) => setNoticiaEditar(prev => ({ ...prev, contenido: value }))}
                                modules={{
                                    toolbar: {
                                        container: [
                                            [{ header: [1, 2, 3, false] }],
                                            ["bold", "italic", "underline", "strike"],
                                            [{ color: [] }, { background: [] }],
                                            [{ list: "ordered" }, { list: "bullet" }],
                                            [{ align: [] }],
                                            ["blockquote", "code-block"],
                                            ["link", "image"],
                                            ["clean"]
                                        ],
                                        handlers: {
                                            image: imageHandler
                                        }
                                    },
                                    clipboard: {
                                        matchVisual: false
                                    },
                                    history: {
                                        delay: 1000,
                                        maxStack: 100,
                                        userOnly: true
                                    },
                                    keyboard: {
                                        bindings: {}
                                    }
                                }}
                                bounds=".modal-carta.crear"
                                scrollingContainer=".modal-carta.crear"
                                preserveWhitespace={true}
                                placeholder="Escribe el contenido de tu noticia aquí... Para insertar imágenes, haz clic en el botón de imagen (📷) en la barra de herramientas y selecciona una imagen de tu dispositivo"
                            />

                            <button onClick={handleEditarNoticia}>Guardar Cambios</button>
                        </div>
                    </div>
                )}

                {/* Modal para ver el contenido completo de una noticia */}
                {mostrarModalVer && noticiaVer && (
                    <div className="modal-overlay" onClick={(e) => e.preventDefault()}>
                        <div className="modal-carta ver" onClick={(e) => e.stopPropagation()}>
                            <span className="modal-cerrar" onClick={() => setMostrarModalVer(false)}>&times;</span>
                            <h3>{noticiaVer.title}</h3>
                            <div 
                                className="noticia-contenido"
                                dangerouslySetInnerHTML={{ __html: noticiaVer.content }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Noticias;
