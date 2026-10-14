import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrdersApi, updateOrderStatusApi } from "../services/orderApi.js";
import { formatPrice } from "../services/productApi.js";

const STATUS_STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMyOrdersApi();
      setOrders(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const updated = await updateOrderStatusApi(orderId, newStatus);
      setOrders((prev) =>
        prev.map((ord) => (ord._id === orderId ? { ...ord, status: updated.status } : ord))
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-4 py-16 text-slate-900" aria-busy="true">
        <div className="mx-auto max-w-4xl text-center">
          <p className="rounded-2xl border border-slate-200 bg-white p-8 text-lg text-slate-600 shadow-sm">
            Loading your orders...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-4 py-16 text-slate-900">
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
            <p className="text-lg font-medium text-red-800 mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="rounded-xl bg-amber-300 px-6 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-200 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-4 py-20 text-slate-900">
        <div className="mx-auto max-w-md text-center">
          <div className="text-6xl mb-6">📦</div>
          <h1 className="text-3xl font-semibold mb-3 text-slate-950">
            You have not placed any orders yet.
          </h1>
          <p className="text-base text-slate-600 mb-8">
            When you complete a checkout, your historical orders will appear here.
          </p>
          <Link
            to="/products"
            className="inline-block rounded-xl bg-amber-300 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-amber-200 shadow-sm"
          >
            Start Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-6 text-slate-900 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              My Orders
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              You have placed {orders.length} {orders.length === 1 ? "order" : "orders"}.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-block rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="space-y-6">
          {orders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            const currentStepIdx = STATUS_STEPS.indexOf(order.status);

            return (
              <div
                key={order._id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm transition hover:shadow-md"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-4 mb-4 gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Order ID
                    </span>
                    <p className="font-mono font-semibold text-slate-900 text-base">
                      #{order._id}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-xs text-slate-500 block">Placed on</span>
                    <span className="text-sm font-medium text-slate-800">{formattedDate}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-sm py-1"
                    >
                      <div className="text-slate-800">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-slate-500 ml-2">× {item.quantity}</span>
                      </div>
                      <span className="font-medium text-slate-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Visual Status Progression Tracker */}
                <div className="my-5 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="text-xs font-semibold text-slate-500 mb-2 uppercase">
                    Delivery Progression
                  </div>
                  <div className="flex items-center justify-between">
                    {STATUS_STEPS.map((step, idx) => {
                      const isCompleted = currentStepIdx >= idx;
                      const isCurrent = currentStepIdx === idx;
                      return (
                        <div key={step} className="flex-1 flex flex-col items-center relative">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                              isCompleted
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-200 text-slate-500"
                            } ${isCurrent ? "ring-2 ring-emerald-300" : ""}`}
                          >
                            {isCompleted ? "✓" : idx + 1}
                          </div>
                          <span
                            className={`text-[10px] mt-1.5 font-medium ${
                              isCompleted ? "text-emerald-800 font-semibold" : "text-slate-400"
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer with Total and Actions */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center pt-3 border-t border-slate-100 gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Total Amount</div>
                    <div className="text-xl font-bold text-slate-950">
                      {formatPrice(order.totalAmount)}
                    </div>
                    <div className="flex gap-2 items-center mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        Status: <strong className="ml-1 text-slate-900">{order.status}</strong>
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          order.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        Payment: {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Bonus: Dev status changer */}
                    <select
                      value={order.status}
                      disabled={updatingId === order._id}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-400 cursor-pointer"
                      title="Bonus: Update status progression"
                    >
                      {STATUS_STEPS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <Link
                      to={`/orders/${order._id}`}
                      className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 shadow-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
