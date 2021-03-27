import { useState } from "react";
import type { IField } from "./SuperDynamicForm/ISuperDynamicForm";
import { SuperDynamicForm } from "./SuperDynamicForm/SuperDynamicForm";

export const App = () => {
  const [result, setResult] = useState<IField[]>();

  const menuItem: React.CSSProperties = {
    padding: "10px",
  };

  const selectedMenuItem: React.CSSProperties = {
    backgroundColor: "gray",
  };

  return (
    <div>
      <nav style={{ display: "flex", marginBottom: "3px" }}>
        <div style={menuItem}>File</div>
        <div style={Object.assign(selectedMenuItem, menuItem)}>Edit</div>
        <div style={menuItem}>About</div>
      </nav>
      <div style={{ float: "left", width: "100px" }}>
        <div style={menuItem}>Left sidebar</div>
        <div style={menuItem}>Item 2</div>
      </div>
      <div style={{ marginLeft: "100px" }}>
        {result ? <pre>{JSON.stringify(result, null, 2)}</pre> : <SuperDynamicForm query="?querystring=" endpoint="http://hostname.com" onDone={setResult} />}
        <footer style={{ height: "32px", verticalAlign: "center" }}> </footer>
      </div>
    </div>
  );
};
