/* Documentation: see docs/components/Loading.jsx.md */

export default function Loading({ text = "Loading..." }) {
  return <div className="opacity-70">{text}</div>;
}