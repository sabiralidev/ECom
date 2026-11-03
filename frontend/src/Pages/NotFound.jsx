import { Link } from "react-router-dom";

const NotFound = () => (
  <main className="storefront-shell grid min-h-[65vh] place-items-center px-6 py-20 text-center">
    <div className="max-w-xl">
      <p className="eyebrow">404 · Page not found</p>
      <h1 className="display-title mt-3 text-6xl">Lost in the edit.</h1>
      <p className="mt-4 text-[var(--ink-soft)]">That page may have moved. Browse the latest pieces or return to the studio home.</p>
      <Link to="/collections" className="premium-button mt-7">Explore the collection</Link>
    </div>
  </main>
);

export default NotFound;
