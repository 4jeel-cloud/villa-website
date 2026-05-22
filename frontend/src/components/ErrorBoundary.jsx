import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }
  render() {
    if (this.state.error) {
      return React.createElement("section", {
        className: "card",
        style: { margin: "6rem auto", maxWidth: 480, textAlign: "center", padding: "2rem" }
      },
        React.createElement("h2", { style: { color: "#ef4444" } }, "Something went wrong"),
        React.createElement("p", { style: { color: "#64748b" } }, this.state.error.message),
        React.createElement("button", {
          className: "formSubmit",
          style: { maxWidth: 200, margin: "1rem auto 0" },
          onClick: () => window.location.reload()
        }, "Reload page")
      );
    }
    return this.props.children;
  }
}
