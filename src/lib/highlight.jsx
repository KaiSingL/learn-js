import { tokenize } from "./tokenize.js";

// Renders tokenized code as React spans. The tokenizer is shared with the
// linter, so highlighting and rule positions can never disagree.
export function highlight(code) {
  const tokens = tokenize(code);
  const out = [];
  let prev = null;

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    let className = null;

    if (token.type === "keyword") className = "tok-key";
    else if (token.type === "string" || token.type === "template" || token.type === "regex") {
      className = "tok-str";
    } else if (token.type === "number") className = "tok-num";
    else if (token.type === "comment") className = "tok-com";
    else if (token.type === "punct") className = "tok-punc";
    else if (token.type === "ident") {
      if (prev && prev.value === "function") className = "tok-fn";
      else if (prev && prev.value === ".") className = "tok-prop";
    }

    if (className) {
      out[out.length] = {
        text: token.value,
        className,
        key: i,
      };
    } else {
      out[out.length] = { text: token.value, className: null, key: i };
    }

    if (token.type !== "space" && token.type !== "comment") prev = token;
  }

  return out.map(function (part) {
    if (part.className === null) return part.text;
    return (
      <span key={part.key} className={part.className}>
        {part.text}
      </span>
    );
  });
}
