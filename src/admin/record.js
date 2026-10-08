// Building a blank record from a resource's field descriptions.
//
// Apart from `fields.jsx` so that file exports nothing but components.

/** A blank record for the "add" form, using each column's declared default. */
export function emptyRecord(columns) {
  const out = {};
  for (const [name, col] of Object.entries(columns)) {
    if (col.default !== undefined) out[name] = col.default;
    else if (col.type === "json") out[name] = [];
    else if (col.type === "bool") out[name] = true;
    else if (col.type === "int") out[name] = 0;
    else if (col.type === "ref") out[name] = null;
    else out[name] = "";
  }
  return out;
}
