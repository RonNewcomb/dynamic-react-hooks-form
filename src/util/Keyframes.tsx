import * as React from "react";

interface IProps {
  name: string;
  [key: string]: React.CSSProperties | string;
}

export const Keyframes = (props: IProps) => {
  const toCss = (cssObject: React.CSSProperties | string) =>
    typeof cssObject === "string"
      ? cssObject
      : Object.keys(cssObject).reduce((accumulator, key) => {
          const cssKey = key.replace(/[A-Z]/g, v => `-${v.toLowerCase()}`);
          const cssValue = (cssObject as any)[key].toString().replace("'", "");
          return `${accumulator}${cssKey}:${cssValue};`;
        }, "");

  return (
    <style>
      {`@keyframes ${props.name} {
        ${Object.keys(props)
          .map(k => (["from", "to"].includes(k) ? `${k} { ${toCss(props[k])} }` : /^_[0-9]+$/.test(k) ? `${k.replace("_", "")}% { ${toCss(props[k])} }` : ""))
          .join(" ")}
      }`}
    </style>
  );
};
