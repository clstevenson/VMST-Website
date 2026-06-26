import DOMPurify from "dompurify";

// html-react-parser does not sanitize its input. post.content is Quill-authored
// HTML from a "leader" account; sanitize it before parsing so a malicious or
// compromised leader account can't inject a stored XSS payload (eg an <img
// onerror=...> tag) into every visitor's page.
export default function sanitizeHtml(html) {
  // data-relative is set by quill-blot-formatter2 for percentage-based resizes
  // and drives the responsive width breakpoints in ContentWrapper; without
  // it in the allowed list DOMPurify strips it and the breakpoints never fire
  return DOMPurify.sanitize(html, { ADD_ATTR: ["data-relative"] });
}
