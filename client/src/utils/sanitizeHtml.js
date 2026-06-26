import DOMPurify from "dompurify";

// html-react-parser does not sanitize its input. post.content is Quill-authored
// HTML from a "leader" account; sanitize it before parsing so a malicious or
// compromised leader account can't inject a stored XSS payload (eg an <img
// onerror=...> tag) into every visitor's page.
export default function sanitizeHtml(html) {
  // data-relative is set by quill-blot-formatter2 for percentage-based resizes
  // and drives the responsive width breakpoints in ContentWrapper; without
  // it in the allowed list DOMPurify strips it and the breakpoints never fire
  const clean = DOMPurify.sanitize(html, { ADD_ATTR: ["data-relative"] });
  // Quill's clipboard paste converts spaces to &nbsp; (U+00A0). Those are
  // non-breaking and prevent normal word-wrap, causing mid-word breaks when
  // overflow-wrap kicks in. Replace them with regular spaces for display.
  return clean.replace(/&nbsp;/g, " ");
}
