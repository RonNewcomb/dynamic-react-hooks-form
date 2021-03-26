const overlay: React.CSSProperties = {
  position: "absolute",
  backgroundColor: "gray",
  opacity: 0.5,
  cursor: "none",
  width: 400, // whatever
};

const off: React.CSSProperties = {
  opacity: 1,
  cursor: "initial",
  marginTop: "2em", // whatever
};

interface IProps extends React.PropsWithChildren<any> {
  if: boolean;
}

export const Overlay = (props: IProps) => <div style={props.if ? overlay : off}>{props.children}</div>;
