import { Component, type ReactNode } from "react";

/** An optional decoration must never take the page content down with a failed chunk. */
export class DecorativeBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
