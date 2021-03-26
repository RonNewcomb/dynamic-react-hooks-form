import * as React from "react";

interface IProps {
  name: string;
  [key: string]: React.CSSProperties | string;
}

/**
 * Allows defining and naming some keyframes for CSS animations
 *
 * Usage:
 *
 *   <Keyframes name="oscillate" _0={{ opacity: 0.9 }} _100={{ opacity: 0.2 }} />
 *
 *   <Keyframes name="oscillate" from={{ opacity: 0.9 }} to={{ opacity: 0.2 }} />
 *
 * Client code then uses the "animation" CSS properties to refer to the Name given to Keyframes
 */
export const Keyframes = (props: IProps) => {
  const toCss = (cssObject: React.CSSProperties | string): string =>
    typeof cssObject === "string"
      ? cssObject
      : Object.keys(cssObject)
          .map(key => {
            const cssKey = key.replace(/[A-Z]/g, v => `-${v.toLowerCase()}`);
            const cssValue = (cssObject as any)[key].toString().replace("'", "");
            return `${cssKey}:${cssValue};`;
          })
          .join("");

  return (
    <style>
      {`@keyframes ${props.name} {
        ${Object.keys(props)
          .map(key => {
            if (["from", "to"].includes(key)) return `${key} { ${toCss(props[key])} }`;
            if (/^_[0-9]+$/.test(key)) return `${key.replace("_", "")}% { ${toCss(props[key])} }`;
            return "";
          })
          .join(" ")}
      }`}
    </style>
  );
};
