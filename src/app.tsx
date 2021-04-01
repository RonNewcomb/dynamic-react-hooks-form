import * as React from "react";
import { useState } from "react";
import { FilePage } from "./FilePage";
import { PageWithExample } from "./PageWithExample";
import { PageWithForm } from "./PageWithForm";

export const App = () => {
  const [tab, setTab] = useState(2);
  return (
    <>
      <nav>
        <div onClick={_ => setTab(1)}>File</div>
        <div onClick={_ => setTab(2)}>Edit</div>
        <div onClick={_ => setTab(3)}>About</div>
      </nav>
      <aside>
        <div>Left sidebar</div>
        <div>Item 2</div>
      </aside>
      <main>{tab === 1 ? <FilePage /> : tab == 2 ? <PageWithForm /> : <PageWithExample />}</main>
      <footer>&copy; ~~~ ~~ ~~~~ ~~ </footer>
      <style>
        {`
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
        nav > div {
          padding: 0 16px;
        }
        nav > div:hover {
          background-color: ${ambientColor};
          color: ${textColor};
          border-radius: 10px;
          cursor: pointer;
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
export const leftSidebarWidth = 120;
export const ambientColor = "tan";
export const topbarColor = "#333";
export const textColor = "black";
export const textColorInverse = "white";
export const panelColor = "hsl(39deg 77% 90%)"; // "light wheat"
export const panelPadding = 14;
export const panelBorder = 2;
export const panelMargin = 10;
export const panelExterior = panelPadding + panelBorder + panelMargin;
export const panel = `
  background-color: ${panelColor};
  margin: ${panelMargin}px;
  border: ${panelBorder}px solid ${textColorInverse};
  border-radius: 10px;
  padding: ${panelPadding}px;
`;
