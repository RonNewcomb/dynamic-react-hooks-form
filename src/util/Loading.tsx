import { Keyframes } from "./Keyframes";

const glowup: React.CSSProperties = {
  animationName: "oscillate",
  animationDirection: "alternate",
  animationDuration: "0.5s",
  animationIterationCount: "infinite",
};

export const Loading = () => (
  <h2 style={glowup}>
    Loading...
    <Keyframes name="oscillate" _0={{ opacity: 0.9 }} _100={{ opacity: 0.2 }} />
  </h2>
);
