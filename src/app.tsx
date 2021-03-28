import { useState } from "react";
import type { IField } from "./SuperDynamicForm/ISuperDynamicForm";
import { SuperDynamicForm } from "./SuperDynamicForm/SuperDynamicForm";

export const App = () => {
  const [result, setResult] = useState<IField[]>();
  return (
    <>
      <nav>
        <div>File</div>
        <div>Edit</div>
        <div>About</div>
      </nav>
      <aside>
        <div>Left sidebar</div>
        <div>Item 2</div>
      </aside>
      <main>
        {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
        {!result && <SuperDynamicForm query="?querystring=" endpoint="http://hostname.com" onDone={setResult} />}
      </main>
      <footer>&copy; /\/\/\/\/\/\/\/\/</footer>
      <style>
        {`
          .superDynamicForm {
            max-width: 400;
            margin: auto;
          }
          .superDynamicForm [newlyAdded] {
          }
          .superDynamicForm [removing] {
          }

          body {
            font-family: Verdana, sans-serif;
            font: menu;
            background-color: ${ambientColor};
            color: ${textColor};
          }
          nav {
            display: flex;
            ${panel};
            background-color: ${topbarColor};
            color: ${textColorInverse};
          }
          nav > * {
            padding: 0 16px;
          }
          aside {
            float: left;
            width: calc(${leftSidebarWidth}px - ${panelExterior}px);
            font-weight: 800;
            ${panel}
          }
          aside > * {
            padding: 10px;
          }
          main {
            min-height: 70vh;
            ${panel}
            margin-left: calc(${leftSidebarWidth}px + ${panelExterior}px) !important;
          }
          footer {
            font-size: xx-small;
            text-align: right;
            opacity: 0.5;
            margin: 16px;
          }
        `}
      </style>
    </>
  );
};
const leftSidebarWidth = 120;
const ambientColor = "tan";
const topbarColor = "#333";
const textColor = "black";
const textColorInverse = "white";
const panelColor = "hsl(39deg 77% 90%)"; // "light wheat"
const panelPadding = 14;
const panelBorder = 2;
const panelMargin = 10;
const panelExterior = panelPadding + panelBorder + panelMargin;
const panel = `
  background-color: ${panelColor};
  margin: ${panelMargin}px;
  border: ${panelBorder}px solid ${textColorInverse};
  border-radius: 10px;
  padding: ${panelPadding}px;
`;
