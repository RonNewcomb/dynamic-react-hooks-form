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
        {result ? <pre>{JSON.stringify(result, null, 2)}</pre> : <SuperDynamicForm query="?querystring=" endpoint="http://hostname.com" onDone={setResult} />}
      </main>
      <footer>&copy; /\/\/\/\/\/\/\/\/</footer>
      <style>
        {`
          .superDynamicForm {
            max-width: 400;
            margin: auto;
          }
          .superDynamicForm new {
            max-width: 400;
            margin: auto;
          }

          body {
            margin: 0;
            background-color: ${ambientColor};
            color: ${textColor};
            font-family: Verdana, sans-serif;
            font: menu;
          }
          nav {
            display: flex;
            padding: 0 10px;
            background-color: ${topbarColor};
            color: ${textColorInverse};
          }
          nav > * {
            padding: 14px 16px;
          }
          nav > *:hover {
            background-color: ${ambientColor};
          }
          aside {
            float: left;
            width: calc(${leftSidebarWidth} - 50px);
            background-color: ${panelColor};
            font-weight: 600;
            border: 2px solid ${textColorInverse};
            border-left: 0;
            border-radius: 0 10px 10px 0;
            margin: 10 10 10 0;
            padding: 14 14 14 0;
          }
          aside > * {
            padding: 10px;
          }
          main {
            min-height: 80vh;
            background-color: ${panelColor};
            border-radius: 10px 0 0 10px;
            border: 2px solid ${textColorInverse};
            border-right: 0;
            margin: 10 0 10 ${leftSidebarWidth};
            padding: 14 0 14 14;
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
