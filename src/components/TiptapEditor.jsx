import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import '../styles/tiptap-editor.css';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Indent, Outdent, 
  Link as LinkIcon, Image as ImageIcon, Youtube as YoutubeIcon,
  Heading1, Heading2, Heading3, 
  Quote, Code, 
  Palette, 
  Undo, Redo, 
  X, Eye
} from 'lucide-react';

const TiptapEditor = ({ 
  content, 
  onChange, 
  placeholder = 'Escribe el contenido aquí...',
  onImageUpload,
  readOnly = false
}) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder,
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !readOnly,
  });

  useEffect(() => {
    // This ensures the editor content is updated when the content prop changes
    // (e.g., when switching between create and edit modes)
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (event) => {
      if (event.target.files?.length) {
        const file = event.target.files[0];
        
        // If an external image upload handler is provided, use it
        if (onImageUpload) {
          onImageUpload(file);
        }
        
        // Create a local URL for immediate display in the editor
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            editor.chain().focus().setImage({ src: reader.result }).run();
          }
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  const handleLinkSubmit = (e) => {
    e.preventDefault();
    // Check if URL is valid
    if (linkUrl) {
      // Add https:// if not present and not starting with http://
      let url = linkUrl;
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      
      editor.chain().focus().setLink({ href: url }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setShowLinkModal(false);
    setLinkUrl('');
  };

  const handleYoutubeSubmit = (e) => {
    e.preventDefault();
    if (youtubeUrl) {
      editor.commands.setYoutubeVideo({
        src: youtubeUrl,
      });
    }
    setShowYoutubeModal(false);
    setYoutubeUrl('');
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    editor.chain().focus().setColor(color).run();
    setShowColorPicker(false);
  };

  return (
    <div className="tiptap-editor-wrapper">
      {!readOnly && (
        <div className="tiptap-toolbar">
          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
              title="Encabezado 1"
            >
              <Heading1 size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
              title="Encabezado 2"
            >
              <Heading2 size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
              title="Encabezado 3"
            >
              <Heading3 size={18} />
            </button>
          </div>

          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'is-active' : ''}
              title="Negrita"
            >
              <Bold size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'is-active' : ''}
              title="Cursiva"
            >
              <Italic size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive('underline') ? 'is-active' : ''}
              title="Subrayado"
            >
              <UnderlineIcon size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive('strike') ? 'is-active' : ''}
              title="Tachado"
            >
              <Strikethrough size={18} />
            </button>
            <div className="color-button-container">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Color de texto"
              >
                <Palette size={18} style={{ color: selectedColor }} />
              </button>
              {showColorPicker && (
                <div className="color-picker">
                  {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map(color => (
                    <div 
                      key={color} 
                      className="color-option" 
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
              title="Alinear a la izquierda"
            >
              <AlignLeft size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
              title="Centrar"
            >
              <AlignCenter size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
              title="Alinear a la derecha"
            >
              <AlignRight size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}
              title="Justificar"
            >
              <AlignJustify size={18} />
            </button>
          </div>

          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive('bulletList') ? 'is-active' : ''}
              title="Lista con viñetas"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive('orderedList') ? 'is-active' : ''}
              title="Lista numerada"
            >
              <ListOrdered size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().indent().run()}
              title="Aumentar sangría"
            >
              <Indent size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().outdent().run()}
              title="Disminuir sangría"
            >
              <Outdent size={18} />
            </button>
          </div>

          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={editor.isActive('blockquote') ? 'is-active' : ''}
              title="Cita"
            >
              <Quote size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={editor.isActive('codeBlock') ? 'is-active' : ''}
              title="Bloque de código"
            >
              <Code size={18} />
            </button>
          </div>

          <div className="toolbar-group">
            <button
              onClick={() => setShowLinkModal(true)}
              className={editor.isActive('link') ? 'is-active' : ''}
              title="Enlace"
            >
              <LinkIcon size={18} />
            </button>
            <button
              onClick={handleImageUpload}
              title="Imagen"
            >
              <ImageIcon size={18} />
            </button>
            <button
              onClick={() => setShowYoutubeModal(true)}
              title="Video de YouTube"
            >
              <YoutubeIcon size={18} />
            </button>
          </div>

          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Deshacer"
            >
              <Undo size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Rehacer"
            >
              <Redo size={18} />
            </button>
          </div>
        </div>
      )}

      <EditorContent editor={editor} className="tiptap-content" />

      {showLinkModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Insertar enlace</h3>
              <button className="close-button" onClick={() => setShowLinkModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleLinkSubmit}>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://ejemplo.com"
                autoFocus
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowLinkModal(false)}>Cancelar</button>
                <button type="submit">Insertar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showYoutubeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Insertar video de YouTube</h3>
              <button className="close-button" onClick={() => setShowYoutubeModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleYoutubeSubmit}>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                autoFocus
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowYoutubeModal(false)}>Cancelar</button>
                <button type="submit">Insertar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TiptapEditor;