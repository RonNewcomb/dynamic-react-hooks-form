const overlay: React.CSSProperties = {
  position: "absolute",
  backgroundColor: "gray",
  opacity: 0.5,
  cursor: "none",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};

interface IProps extends React.PropsWithChildren<any> {
  if: boolean;
}

export const Overlay = (props: IProps) => (
  <div style={{ position: "relative" }}>
    {props.children}
    {props.if && <div style={overlay}></div>}
  </div>
);
