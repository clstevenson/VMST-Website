/* eslint-disable react/prop-types */
/*
 Thin wrapper around vanilla Quill (not react-quill), following Quill's own
 official React integration pattern:
 https://github.com/slab/quill/blob/main/packages/website/src/playground/react/Editor.js

 This is an UNCONTROLLED component: `defaultValue` seeds the editor once at
 mount (or remount, eg when the `key` prop changes) and is never re-read
 after that. Content changes are reported via `onTextChange`, called with
 the editor's current HTML (via `getSemanticHTML()`) rather than Quill's
 raw Delta, since the app stores/sends email and post content as HTML.

 `ref` is forwarded directly to the underlying Quill instance (not a
 wrapper object), so callers can call eg `ref.current.getText()` directly.
 */
import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const Editor = forwardRef(
  ({ id, placeholder, modules, defaultValue, onTextChange }, ref) => {
    const containerRef = useRef(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
    });

    useEffect(() => {
      const container = containerRef.current;
      const editorContainer = container.appendChild(
        container.ownerDocument.createElement("div"),
      );
      const quill = new Quill(editorContainer, {
        theme: "snow",
        placeholder,
        modules,
      });

      // ref is optional -- not every caller needs imperative access
      if (ref) ref.current = quill;

      if (defaultValueRef.current) {
        quill.clipboard.dangerouslyPasteHTML(defaultValueRef.current);
      }

      quill.on(Quill.events.TEXT_CHANGE, () => {
        onTextChangeRef.current?.(quill.getSemanticHTML());
      });

      return () => {
        if (ref) ref.current = null;
        container.innerHTML = "";
      };
      // modules/placeholder are only honored at construction (Quill itself
      // doesn't support rebuilding them from changed props); callers that
      // need different modules/placeholder force a remount via `key`
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref]);

    return <div id={id} ref={containerRef}></div>;
  },
);

Editor.displayName = "Editor";

export default Editor;
