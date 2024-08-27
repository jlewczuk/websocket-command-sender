import React from "react";
import { CommandSender } from "./CommandSender/CommandSender";
import { createRoot } from "react-dom/client";

import "./index.css";

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <CommandSender />
  </React.StrictMode>,
);
