import { Component } from "react";
import { Link } from "react-router-dom";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error("Storefront rendering failed", error, info);
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="storefront-shell grid min-h-[65vh] place-items-center px-6 py-20 text-center">
          <div className="max-w-xl">
            <p className="eyebrow">A small interruption</p>
            <h1 className="display-title mt-3 text-5xl">This page needs a moment.</h1>
            <p className="mt-4 text-[var(--ink-soft)]">Your items and account remain safe. Try reloading this page, or return to the collection.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => window.location.reload()} className="premium-button">Reload page</button>
              <Link to="/" className="border border-[var(--line)] px-5 py-3 text-sm font-semibold">Back to home</Link>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
