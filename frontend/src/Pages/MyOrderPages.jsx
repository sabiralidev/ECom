import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  RotateCw,
  Search,
  ShoppingBag,
} from "lucide-react";
import { fetchUserOrders } from "../redux/slices/OrderSlice";

const filters = ["All orders", "Processing", "Shipped", "Delivered", "Cancelled"];

const getOrderStatus = (order) => {
  if (order.status) return order.status;
  if (order.isDelivered) return "Delivered";
  return "Processing";
};

const statusStyles = {
  Processing: "border-amber-200 bg-amber-50 text-amber-800",
  Shipped: "border-sky-200 bg-sky-50 text-sky-800",
  Delivered: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Cancelled: "border-rose-200 bg-rose-50 text-rose-800",
};

const formatDate = (date) => {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
};

const MyOrderPages = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders = [], loading, error } = useSelector((state) => state.order);
  const [activeFilter, setActiveFilter] = useState("All orders");
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  const orderCounts = useMemo(() => {
    const counts = { "All orders": orders.length };
    filters.slice(1).forEach((status) => {
      counts[status] = orders.filter((order) => getOrderStatus(order) === status).length;
    });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const status = getOrderStatus(order);
      const matchesStatus = activeFilter === "All orders" || status === activeFilter;
      const matchesSearch =
        !query ||
        order._id?.toLowerCase().includes(query) ||
        order._id?.slice(-8).toLowerCase().includes(query) ||
        order.orderItem?.some((item) => item.name?.toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [activeFilter, orders, search]);

  const handleRowClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  return (
    <section className="mx-auto w-[90%] space-y-6">
      <div className="flex flex-col gap-5 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Your account / Order history</p>
          <h1 className="display-title text-4xl sm:text-5xl">My orders</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ink-soft)]">
            Keep track of your purchases, delivery progress, and order details.
          </p>
        </div>
        <div className="flex items-center gap-3 border border-[var(--line)] bg-[var(--surface-elevated)] px-4 py-3">
          <Package size={18} strokeWidth={1.6} className="text-[var(--bronze-deep)]" />
          <div>
            <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              Orders placed
            </p>
            <p className="text-lg font-semibold leading-tight">{orders.length}</p>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="flex flex-col gap-3 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <span>{error || "Your orders could not be loaded. Please try again."}</span>
          <button
            type="button"
            onClick={() => dispatch(fetchUserOrders())}
            className="inline-flex items-center gap-2 font-semibold underline underline-offset-4"
          >
            <RotateCw size={14} /> Try again
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter orders by status">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
              className={`inline-flex shrink-0 items-center gap-2 border px-3 py-2 text-xs font-semibold transition ${
                activeFilter === filter
                  ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                  : "border-[var(--line)] bg-[var(--surface-elevated)] text-[var(--ink-soft)] hover:border-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              {filter}
              <span className={activeFilter === filter ? "text-white/70" : "text-[var(--ink-soft)]"}>
                {orderCounts[filter]}
              </span>
            </button>
          ))}
        </div>
        <label className="relative block w-full lg:max-w-xs">
          <Search
            size={16}
            strokeWidth={1.7}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order or item"
            aria-label="Search orders by order number or item"
            className="w-full border border-[var(--line)] bg-[var(--surface-elevated)] py-2.5 pl-10 pr-3 text-sm"
          />
        </label>
      </div>

      {loading && orders.length === 0 ? (
        <div className="space-y-4" aria-label="Loading orders">
          {[1, 2].map((item) => (
            <div key={item} className="animate-pulse border border-[var(--line)] bg-[var(--surface-elevated)] p-5">
              <div className="mb-5 h-4 w-1/3 bg-[var(--line)]" />
              <div className="flex gap-4">
                <div className="h-20 w-20 shrink-0 bg-[var(--line)]" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 w-1/2 bg-[var(--line)]" />
                  <div className="h-3 w-1/3 bg-[var(--line)]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const items = Array.isArray(order.orderItem) ? order.orderItem : [];
            const firstItem = items[0];
            const status = getOrderStatus(order);
            const address = order.shippingAddress;

            return (
              <article
                key={order._id}
                className="border border-[var(--line)] bg-[var(--surface-elevated)] transition-colors hover:border-[var(--bronze)]"
              >
                <div className="flex flex-col gap-4 border-b border-[var(--line)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <div>
                      <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">Order</p>
                      <p className="mt-1 font-semibold">#{order._id?.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">Placed on</p>
                      <p className="mt-1 text-sm font-medium">{formatDate(order.createdAt)}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-semibold ${
                        statusStyles[status] || statusStyles.Processing
                      }`}
                    >
                      {status === "Delivered" ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
                      {status}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        order.isPaid ? "text-[var(--success)]" : "text-[var(--warning)]"
                      }`}
                    >
                      {order.isPaid ? "Paid" : "Payment pending"}
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">Order total</p>
                    <p className="mt-1 text-lg font-semibold">
                      Rs {Number(order.totalPrice || 0).toLocaleString("en-PK")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:px-5 sm:py-5">
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    {firstItem?.image ? (
                      <img
                        src={firstItem.image}
                        alt={firstItem.name || "Ordered product"}
                        loading="lazy"
                        className="h-20 w-20 shrink-0 border border-[var(--line)] object-cover"
                        onError={(event) => {
                          event.currentTarget.style.visibility = "hidden";
                        }}
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-[var(--line)] bg-[var(--paper)]">
                        <ShoppingBag size={22} className="text-[var(--ink-soft)]" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{firstItem?.name || "Order items"}</p>
                      {firstItem && (
                        <p className="mt-1 text-xs text-[var(--ink-soft)]">
                          Qty {firstItem.quantity || 1}
                          {firstItem.size ? ` · Size ${firstItem.size}` : ""}
                          {firstItem.color ? ` · ${firstItem.color}` : ""}
                        </p>
                      )}
                      {items.length > 1 && (
                        <p className="mt-1 text-xs font-medium text-[var(--bronze-deep)]">
                          + {items.length - 1} more {items.length === 2 ? "item" : "items"}
                        </p>
                      )}
                      <p className="mt-2 flex items-center gap-1.5 truncate text-xs text-[var(--ink-soft)]">
                        <MapPin size={13} className="shrink-0" />
                        {address
                          ? [address.city, address.country].filter(Boolean).join(", ")
                          : "Shipping details available in order"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRowClick(order._id)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--ink)] px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition hover:bg-[var(--ink)] hover:text-white sm:min-w-40"
                  >
                    View order <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : orders.length === 0 && !loading && !error ? (
        <div className="border border-dashed border-[var(--line)] bg-[var(--surface-elevated)] px-5 py-14 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border border-[var(--line)] bg-[var(--paper)]">
            <ShoppingBag size={22} className="text-[var(--bronze-deep)]" />
          </div>
          <h2 className="display-title text-3xl">Your next favorite starts here.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
            You haven’t placed an order yet. Explore the collection and find something you love.
          </p>
          <button
            type="button"
            onClick={() => navigate("/collections")}
            className="mt-6 inline-flex min-h-11 items-center gap-2 bg-[var(--ink)] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[var(--bronze-deep)]"
          >
            Explore collection <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        <div className="border border-[var(--line)] bg-[var(--surface-elevated)] px-5 py-12 text-center">
          <Search size={20} className="mx-auto mb-3 text-[var(--ink-soft)]" />
          <p className="font-semibold">No matching orders</p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Try another search or choose a different status.</p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setActiveFilter("All orders");
            }}
            className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-[var(--bronze-deep)] underline underline-offset-4"
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
};

export default MyOrderPages;
