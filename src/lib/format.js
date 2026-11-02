// Formats any runtime value as a single line of readable text.
//
// This function is embedded into the sandbox worker with `toString()`, so it
// must stay completely self-contained: no imports, no helpers, no constants.

export function formatValue(value, depth, seen) {
  if (depth === undefined) depth = 0;
  if (seen === undefined) seen = [];

  var type = typeof value;

  if (value === null) return "null";
  if (type === "undefined") return "undefined";
  if (type === "string") {
    return depth === 0 ? value : JSON.stringify(value);
  }
  if (type === "number") {
    if (value !== value) return "NaN";
    if (value === Infinity) return "Infinity";
    if (value === -Infinity) return "-Infinity";
    if (value === 0 && 1 / value === -Infinity) return "-0";
    return String(value);
  }
  if (type === "boolean") return value ? "true" : "false";
  if (type === "bigint") return String(value) + "n";
  if (type === "symbol") return String(value);
  if (type === "function") {
    var fnName = value.name ? value.name : "anonymous";
    return "function " + fnName + "()";
  }

  var tag = Object.prototype.toString.call(value);

  if (tag === "[object Error]") {
    return (value.name || "Error") + ": " + value.message;
  }
  if (tag === "[object Date]") {
    var time = value.getTime();
    return time === time ? value.toISOString() : "Invalid Date";
  }
  if (tag === "[object RegExp]") return String(value);

  if (seen.indexOf(value) !== -1) return "[Circular]";
  if (depth > 3) {
    if (Array.isArray(value)) return "[Array(" + value.length + ")]";
    return "{…}";
  }

  var nextSeen = seen.concat([value]);

  if (tag === "[object Map]") {
    var mapParts = [];
    value.forEach(function (mapValue, mapKey) {
      if (mapParts.length < 20) {
        mapParts[mapParts.length] =
          formatValue(mapKey, depth + 1, nextSeen) +
          " => " +
          formatValue(mapValue, depth + 1, nextSeen);
      }
    });
    return "Map(" + value.size + ") {" + (mapParts.length > 0 ? " " + mapParts.join(", ") + " " : "") + "}";
  }

  if (tag === "[object Set]") {
    var setParts = [];
    value.forEach(function (setValue) {
      if (setParts.length < 20) {
        setParts[setParts.length] = formatValue(setValue, depth + 1, nextSeen);
      }
    });
    return "Set(" + value.size + ") {" + (setParts.length > 0 ? " " + setParts.join(", ") + " " : "") + "}";
  }

  if (typeof value.nodeType === "number" && typeof value.nodeName === "string") {
    var nodeName = String(value.nodeName).toLowerCase();
    if (value.nodeType === 1) {
      var attrs = "";
      if (value.id) attrs = attrs + "#" + value.id;
      if (value.className && typeof value.className === "string") {
        attrs = attrs + "." + value.className.split(" ").join(".");
      }
      return "<" + nodeName + attrs + ">";
    }
    if (value.nodeType === 3) {
      return "#text " + JSON.stringify(String(value.nodeValue).slice(0, 40));
    }
    return "<" + nodeName + ">";
  }

  if (Array.isArray(value)) {
    var parts = [];
    var limit = value.length < 50 ? value.length : 50;
    for (var i = 0; i < limit; i = i + 1) {
      parts[parts.length] = formatValue(value[i], depth + 1, nextSeen);
    }
    if (value.length > limit) parts[parts.length] = "… " + (value.length - limit) + " more";
    return "[" + parts.join(", ") + "]";
  }

  var keys = Object.keys(value);
  if (keys.length === 0) {
    if (tag === "[object Object]") return "{}";
    return tag.replace("object ", "").replace("]", "") + "]";
  }

  var entries = [];
  for (var k = 0; k < keys.length && k < 30; k = k + 1) {
    var key = keys[k];
    var safeKey = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
    entries[entries.length] = safeKey + ": " + formatValue(value[key], depth + 1, nextSeen);
  }
  if (keys.length > 30) entries[entries.length] = "… " + (keys.length - 30) + " more";
  return "{ " + entries.join(", ") + " }";
}

export function formatArgs(args) {
  const parts = [];
  for (let i = 0; i < args.length; i += 1) {
    parts[parts.length] = formatValue(args[i], 0, []);
  }
  return parts.join(" ");
}
