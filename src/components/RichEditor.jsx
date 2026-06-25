import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { uploadImage, validateImageFile, cldUrl, hasCloudinary } from '../lib/cloudinary.js';

// Editor WYSIWYG per gli articoli del blog. La formattazione (Titolo 2/3,
// grassetto, corsivo, elenchi, link, immagini) è applicata realmente: l'editor
// produce HTML pulito, senza simboli Markdown. Il Titolo 1 è il campo "Titolo"
// dell'articolo, quindi nel corpo si usano solo H2/H3 (come da linee guida).

const TB_BTN = (T, active) => ({
  border: 'none', background: active ? T.ink1 : 'transparent', color: active ? '#fff' : T.ink1,
  borderRadius: 6, padding: '5px 9px', cursor: 'pointer', fontFamily: T.fontBody,
  fontSize: 13, fontWeight: 600, lineHeight: 1,
});

function Btn({ T, onClick, active, title, children }) {
  return (
    <button type="button" title={title} onMouseDown={(e) => e.preventDefault()} onClick={onClick} style={TB_BTN(T, active)}>
      {children}
    </button>
  );
}

export function RichEditor({ T, value, onChange }) {
  const fileRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: false }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Image.configure({ inline: false, HTMLAttributes: { loading: 'lazy' } }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sincronizza quando il valore arriva dall'esterno (es. bozza AI) e differisce.
  useEffect(() => {
    if (editor && value != null && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const setLink = () => {
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt('URL del link (interno es. /cerca, o esterno https://…):', prev);
    if (url === null) return;
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    const err = validateImageFile(file); if (err) { window.alert(err); return; }
    try {
      const res = await uploadImage(file, { folder: 'noleggio/blog' });
      const url = cldUrl(res.public_id, { w: 1000 }) || res.url;
      const alt = window.prompt('Testo alternativo dell\'immagine (SEO/accessibilità):', '') || '';
      editor.chain().focus().setImage({ src: url, alt }).run();
    } catch (err2) { window.alert('Upload fallito: ' + err2.message); }
  };

  return (
    <div style={{ border: `1px solid ${T.line}`, borderRadius: T.r.sm, background: T.surface }}>
      <style>{`
        .moviq-rte .ProseMirror { outline: none; min-height: 240px; padding: 12px 14px; font-family: ${T.fontBody}; font-size: 15px; line-height: 1.65; color: ${T.ink1}; }
        .moviq-rte .ProseMirror h2 { font-family: ${T.fontDisplay}; font-size: 22px; font-weight: 700; margin: 18px 0 8px; }
        .moviq-rte .ProseMirror h3 { font-family: ${T.fontDisplay}; font-size: 18px; font-weight: 600; margin: 16px 0 6px; }
        .moviq-rte .ProseMirror p { margin: 0 0 12px; }
        .moviq-rte .ProseMirror ul, .moviq-rte .ProseMirror ol { margin: 0 0 12px; padding-left: 22px; }
        .moviq-rte .ProseMirror li { margin: 3px 0; }
        .moviq-rte .ProseMirror a { color: ${T.ink1}; text-decoration: underline; }
        .moviq-rte .ProseMirror img { max-width: 100%; border-radius: ${T.r.md}px; margin: 6px 0; }
        .moviq-rte .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: ${T.ink3}; float: left; pointer-events: none; height: 0; }
      `}</style>

      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, padding: 6, borderBottom: `1px solid ${T.line}`, background: T.surfaceAlt, borderTopLeftRadius: T.r.sm, borderTopRightRadius: T.r.sm }}>
        <Btn T={T} title="Titolo 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>T2</Btn>
        <Btn T={T} title="Titolo 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>T3</Btn>
        <span style={{ width: 1, background: T.line, margin: '2px 4px' }} />
        <Btn T={T} title="Grassetto" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></Btn>
        <Btn T={T} title="Corsivo" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></Btn>
        <span style={{ width: 1, background: T.line, margin: '2px 4px' }} />
        <Btn T={T} title="Elenco puntato" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>• Lista</Btn>
        <Btn T={T} title="Elenco numerato" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. Lista</Btn>
        <span style={{ width: 1, background: T.line, margin: '2px 4px' }} />
        <Btn T={T} title="Link" active={editor.isActive('link')} onClick={setLink}>🔗 Link</Btn>
        {hasCloudinary && (
          <>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
            <Btn T={T} title="Inserisci immagine" onClick={() => fileRef.current?.click()}>🖼 Immagine</Btn>
          </>
        )}
        <span style={{ flex: 1 }} />
        <Btn T={T} title="Annulla" onClick={() => editor.chain().focus().undo().run()}>↶</Btn>
        <Btn T={T} title="Ripeti" onClick={() => editor.chain().focus().redo().run()}>↷</Btn>
      </div>

      <div className="moviq-rte">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
