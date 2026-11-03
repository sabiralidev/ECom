
import { useEffect, useId, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HiMagnifyingGlass, HiMiniXMark } from "react-icons/hi2";
import axios from "axios";

const SearchBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const suggestionsId = `search-suggestions-${useId().replace(/:/g, "")}`;
  const [searchItem, setSearchItem] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const recent = JSON.parse(localStorage.getItem("ec-recent-searches") || "[]");
      return Array.isArray(recent) ? recent.slice(0, 5) : [];
    } catch {
      return [];
    }
  });
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState(false);
  const suggestedCategories = useMemo(
    () => [...new Set(suggestions.map((product) => product.category).filter(Boolean))].slice(0, 3),
    [suggestions]
  );

  const currentSearchValue = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("search") || "";
  }, [location.search]);

  useEffect(() => {
    if (!isOpen) {
      setSearchItem(currentSearchValue);
    }
  }, [currentSearchValue, isOpen]);

  useEffect(() => {
    const term = searchItem.trim();
    if (!isOpen || term.length < 2) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setSuggestionsLoading(true);
      setSuggestionsError(false);
      try {
        const query = new URLSearchParams({ search: term, limit: "5" });
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products?${query.toString()}`,
          { signal: controller.signal }
        );
        if (Array.isArray(response.data)) setSuggestions(response.data);
      } catch (error) {
        if (error.code !== "ERR_CANCELED") {
          setSuggestions([]);
          setSuggestionsError(true);
        }
      } finally {
        if (!controller.signal.aborted) setSuggestionsLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [isOpen, searchItem]);

  const handleSearchToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchItem(currentSearchValue);
    }
  };

  const applySearch = (value) => {
    const nextValue = value.trim();
    if (nextValue) {
      const nextRecent = [nextValue, ...recentSearches.filter((item) => item.toLowerCase() !== nextValue.toLowerCase())].slice(0, 5);
      setRecentSearches(nextRecent);
      localStorage.setItem("ec-recent-searches", JSON.stringify(nextRecent));
    }
    const params = new URLSearchParams(location.search);

    if (nextValue) {
      params.set("search", nextValue);
    } else {
      params.delete("search");
    }

    const query = params.toString();
    if (location.pathname === "/collections") {
      navigate(`/collections${query ? `?${query}` : ""}`);
      return;
    }

    navigate(`/collections${query ? `?${query}` : ""}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applySearch(searchItem);
    setIsOpen(false);
  };

  return (
    <div
      className={`relative flex items-center justify-center overflow-x-hidden transition-all duration-300 ${
        isOpen ? "w-[18rem] sm:w-[22rem]" : "w-auto"
      }`}
    >
      {isOpen ? (
        <form
          onSubmit={handleSearch}
          className="relative flex w-full items-center"
        >
          <button
            type="button"
            onClick={handleSearchToggle}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] transition-colors duration-200 hover:text-[var(--ink)]"
          >
            <HiMiniXMark className="h-6 w-6" />
          </button>

          <div className="relative w-full">
            <input
              type="text"
              value={searchItem}
              placeholder="Search for products..."
              onChange={(e) => setSearchItem(e.target.value)}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={searchItem.trim().length >= 2}
              aria-controls={suggestionsId}
              className="w-full border border-[var(--line)] bg-[var(--surface-elevated)] px-10 py-2.5 text-sm text-[var(--ink)] placeholder-[#989289] shadow-sm transition-all duration-300 ease-in-out focus:border-[var(--bronze)] focus:outline-none focus:ring-2 focus:ring-[#aa8050]/20"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] transition-colors duration-200 hover:text-[var(--ink)]"
            >
              <HiMagnifyingGlass className="h-5 w-5" />
            </button>
            {(searchItem.trim().length >= 2 || (!searchItem.trim() && recentSearches.length > 0)) && (
              <div id={suggestionsId} role="listbox" aria-label="Search suggestions" className="absolute inset-x-0 top-full z-[var(--layer-drawer)] mt-2 max-h-[min(70vh,28rem)] overflow-y-auto border border-[var(--line)] bg-[var(--surface-elevated)] text-left shadow-atelier">
                {searchItem.trim().length >= 2 ? (
                  <>
                    {suggestionsLoading && <p className="px-4 py-3 text-xs text-[var(--ink-soft)]" role="status">Searching the collection…</p>}
                    {!suggestionsLoading && suggestionsError && <p className="px-4 py-3 text-xs text-[var(--error)]" role="alert">Search is temporarily unavailable. Press Enter to try the full search.</p>}
                    {!suggestionsLoading && !suggestionsError && suggestions.length === 0 && <p className="px-4 py-3 text-xs text-[var(--ink-soft)]">No matching pieces found.</p>}
                    {suggestedCategories.length > 0 && <div className="flex flex-wrap gap-2 border-b border-[var(--line)] px-3 py-2">{suggestedCategories.map((category) => <button key={category} type="button" role="option" aria-selected="false" onClick={() => { setIsOpen(false); navigate(`/collections?category=${encodeURIComponent(category)}`); }} className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--ink-soft)] hover:border-[var(--bronze)] hover:text-[var(--ink)]">{category}</button>)}</div>}
                    {suggestions.map((product) => (
                      <button key={product._id} type="button" role="option" aria-selected="false" onClick={() => { setIsOpen(false); navigate(`/product/${product._id}`); }} className="flex w-full items-center gap-3 border-b border-[var(--line)] px-3 py-2 text-left last:border-0 hover:bg-[var(--paper)]">
                        {product.images?.[0]?.url && <img src={product.images[0].url} alt="" className="h-12 w-10 object-cover" loading="lazy" />}
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-[var(--ink)]">{product.name}</span><span className="block text-xs text-[var(--ink-soft)]">{product.category}</span></span>
                        <span className="whitespace-nowrap text-xs text-[var(--ink-soft)]">Rs {Number(product.discountPrice || product.price || 0).toLocaleString()}</span>
                      </button>
                    ))}
                    <button type="button" role="option" aria-selected="false" onClick={() => { applySearch(searchItem); setIsOpen(false); }} className="w-full px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--bronze-deep)] hover:bg-[var(--paper)]">View all results for “{searchItem.trim()}”</button>
                  </>
                ) : (
                  <div className="p-3">
                    <p className="mb-2 text-[0.62rem] font-bold uppercase tracking-widest text-[var(--ink-soft)]">Recent searches</p>
                    {recentSearches.map((item) => <button key={item} type="button" role="option" aria-selected="false" onClick={() => { setSearchItem(item); applySearch(item); setIsOpen(false); }} className="block w-full px-2 py-2 text-left text-sm text-[var(--ink)] hover:bg-[var(--paper)]">{item}</button>)}
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      ) : (
        <button
          onClick={handleSearchToggle}
          className="text-[var(--ink-soft)] transition-all duration-300 ease-in-out hover:text-[var(--ink)]"
          aria-label="Open search"
        >
          <HiMagnifyingGlass className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
