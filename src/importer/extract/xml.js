/**
 * Minimal, self-contained XML → tree parser for OOXML parts.
 *
 * We deliberately avoid an XML-library dependency: the only parts we read
 * (`word/document.xml`, `word/header*.xml`) are well-formed OOXML without DTDs,
 * and a compact parser works identically in Node and the browser (which the
 * "same Line[] shape for both formats" rule needs). It handles elements,
 * attributes, self-closing tags, text, entities, comments, PIs and CDATA. It
 * does NOT resolve namespaces — OOXML tags are matched by their literal
 * prefixed names (`w:p`, `w:t`, …), which is exactly what we want.
 *
 * Pure: string in, tree out.
 */

/**
 * @typedef {Object} XmlElement
 * @property {string} tag           // '' for the synthetic root
 * @property {Record<string,string>} attrs
 * @property {Array<XmlElement|XmlText>} children
 */

/**
 * @typedef {Object} XmlText
 * @property {string} text
 */

/**
 * Parse an XML string into a tree. The returned node is a synthetic root whose
 * children are the top-level nodes.
 * @param {string} xml
 * @returns {XmlElement}
 */
export function parseXml(xml) {
  /** @type {XmlElement} */
  const root = { tag: '', attrs: {}, children: [] };
  /** @type {XmlElement[]} */
  const stack = [root];
  const top = () => stack[stack.length - 1];
  const n = xml.length;
  let i = 0;

  while (i < n) {
    if (xml[i] === '<') {
      if (startsWith(xml, i, '<!--')) {
        const e = xml.indexOf('-->', i + 4);
        i = e < 0 ? n : e + 3;
      } else if (startsWith(xml, i, '<![CDATA[')) {
        const e = xml.indexOf(']]>', i + 9);
        const end = e < 0 ? n : e;
        top().children.push({ text: xml.slice(i + 9, end) });
        i = e < 0 ? n : e + 3;
      } else if (startsWith(xml, i, '<?')) {
        const e = xml.indexOf('?>', i + 2);
        i = e < 0 ? n : e + 2;
      } else if (startsWith(xml, i, '<!')) {
        const e = xml.indexOf('>', i + 2);
        i = e < 0 ? n : e + 1;
      } else if (xml[i + 1] === '/') {
        // Closing tag.
        const e = xml.indexOf('>', i);
        if (stack.length > 1) stack.pop();
        i = e < 0 ? n : e + 1;
      } else {
        // Opening tag — find its end while respecting quoted attribute values.
        const e = findTagEnd(xml, i + 1);
        let raw = xml.slice(i + 1, e);
        let selfClose = false;
        if (raw.endsWith('/')) {
          selfClose = true;
          raw = raw.slice(0, -1);
        }
        const node = parseTag(raw);
        top().children.push(node);
        if (!selfClose) stack.push(node);
        i = e + 1;
      }
    } else {
      const e = xml.indexOf('<', i);
      const end = e < 0 ? n : e;
      const text = decodeEntities(xml.slice(i, end));
      if (text.length) top().children.push({ text });
      i = end;
    }
  }

  return root;
}

/**
 * @param {string} xml
 * @param {number} from  index just past the '<'
 * @returns {number} index of the closing '>'
 */
function findTagEnd(xml, from) {
  let i = from;
  let quote = '';
  while (i < xml.length) {
    const c = xml[i];
    if (quote) {
      if (c === quote) quote = '';
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === '>') {
      return i;
    }
    i += 1;
  }
  return xml.length;
}

/**
 * @param {string} raw  inside of the tag, e.g. `w:p w:rsidR="00A"`
 * @returns {XmlElement}
 */
function parseTag(raw) {
  raw = raw.trim();
  let j = 0;
  while (j < raw.length && !/\s/.test(raw[j])) j += 1;
  const tag = raw.slice(0, j);
  /** @type {Record<string,string>} */
  const attrs = {};
  const attrRe = /([\w:.-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let m;
  const rest = raw.slice(j);
  while ((m = attrRe.exec(rest))) {
    attrs[m[1]] = decodeEntities(m[3] !== undefined ? m[3] : m[4]);
  }
  return { tag, attrs, children: [] };
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

/**
 * @param {string} s
 * @returns {string}
 */
function decodeEntities(s) {
  if (s.indexOf('&') === -1) return s;
  return s.replace(/&(#x?[0-9a-fA-F]+|\w+);/g, (full, body) => {
    if (body[0] === '#') {
      const code =
        body[1] === 'x' || body[1] === 'X'
          ? parseInt(body.slice(2), 16)
          : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : full;
    }
    return ENTITIES[body] !== undefined ? ENTITIES[body] : full;
  });
}

function startsWith(s, i, prefix) {
  return s.startsWith(prefix, i);
}

/* --------------------------------------------------------------- tree walk */

/**
 * @param {XmlElement|XmlText} node
 * @returns {node is XmlElement}
 */
export function isElement(node) {
  return typeof (/** @type {any} */ (node).tag) === 'string';
}

/**
 * Direct element children with the given tag name.
 * @param {XmlElement} node
 * @param {string} tag
 * @returns {XmlElement[]}
 */
export function childrenNamed(node, tag) {
  return node.children.filter((c) => isElement(c) && c.tag === tag);
}

/**
 * First descendant (depth-first) with the given tag name, or null.
 * @param {XmlElement} node
 * @param {string} tag
 * @returns {XmlElement|null}
 */
export function firstDescendant(node, tag) {
  for (const c of node.children) {
    if (!isElement(c)) continue;
    if (c.tag === tag) return c;
    const found = firstDescendant(c, tag);
    if (found) return found;
  }
  return null;
}

/**
 * All descendants (depth-first, document order) with the given tag name.
 * @param {XmlElement} node
 * @param {string} tag
 * @param {XmlElement[]} [acc]
 * @returns {XmlElement[]}
 */
export function descendantsNamed(node, tag, acc = []) {
  for (const c of node.children) {
    if (!isElement(c)) continue;
    if (c.tag === tag) acc.push(c);
    descendantsNamed(c, tag, acc);
  }
  return acc;
}
