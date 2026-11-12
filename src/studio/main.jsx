import React from "react";
import { createRoot } from "react-dom/client";
import Studio from "./Studio.jsx";
import studioIcon from "./icon.png";
import "./studio.css";

// Favicon from the imported asset: dev gets a URL, the single-file build gets
// an inlined data URI (an HTML <link> would force Vite to emit a separate
// file and break the portable one-file studio).
const favicon = document.createElement("link");
favicon.rel = "icon";
favicon.href = studioIcon;
document.head.appendChild(favicon);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Studio />
  </React.StrictMode>
);
