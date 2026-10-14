import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrderByIdApi, updateOrderStatusApi } from "../services/orderApi.js";
import { formatPrice } from "../services/productApi.js";

const STATUS_STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function fetchOrder() {
      try {
        setLoading(true);
        setError("");
        const data = await getOrderByIdApi(id);
        if (!ignore) setOrder(data);
      } catch (err) {
        if (!ignore) {
          setError(err?.response?.data?.message || "Failed to load order details.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (id) {
      fetchOrder();
    }

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdating(true);
      const updated = await updateOrderStatusApi(id, newStatus);
      setOrder(updated);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-4 py-16 text-slate-900" aria-busy="true">
        <div className="mx-auto max-w-3xl text-center">
          <p className="rounded-2xl border border-slate-200 bg-white p-8 text-lg text-slate-600 shadow-sm">
            Loading order details...
          </p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-4 py-16 text-slate-900">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
            <h1 className="text-xl font-bold text-red-800 mb-2">Order Error</h1>
            <p className="text-sm text-red-600 mb-6">{error || "Order not found."}</p>
            <Link
              to="/orders"
              className="inline-block rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to My Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const currentStepIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-6 text-slate-900 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            to="/orders"
            className="text-sm font-semibold text-amber-700 hover:text-amber-800 transition mb-2 inline-block"
          >
            ← Back to All Orders
          </Link>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                Order Details
              </h1>
              <p className="font-mono text-sm text-slate-500 mt-0.5">#{order._id}</p>
            </div>
            <div className="text-xs text-slate-500">Placed on: {formattedDate}</div>
          </div>
        </div>

        {/* Status Progression */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Status Progression
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Dev controls:</span>
              <select
                value={order.status}
                disabled={isUpdating}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
              >
                {STATUS_STEPS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;
              return (
                <div key={step} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                      isCompleted ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                    } ${isCurrent ? "ring-4 ring-emerald-100" : ""}`}
                  >
                    {isCompleted ? "✓" : idx + 1}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950 mb-4 border-b border-slate-100 pb-3">
              Items Purchased ({order.items?.length || 0})
            </h2>

            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-14 w-14 object-cover rounded-xl border border-slate-200"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">{item.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-950 text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 mt-6 pt-4 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-700">Free</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
                <span className="text-base font-semibold text-slate-900">Total</span>
                <span className="text-2xl font-bold text-slate-950">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div className="space-y-6">
            {/* Delivery address */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-sm">
              <h2 className="font-bold text-slate-950 mb-3 border-b border-slate-100 pb-2">
                Shipping Address
              </h2>
              {order.shippingAddress && (
                <div className="space-y-1 text-slate-700">
                  <p className="font-semibold text-slate-900">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                    {order.shippingAddress.pincode}
                  </p>
                  <p className="text-xs text-slate-500 pt-1">
                    Phone: {order.shippingAddress.phone}
                  </p>
                </div>
              )}
            </div>

            {/* Payment Info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-sm">
              <h2 className="font-bold text-slate-950 mb-3 border-b border-slate-100 pb-2">
                Payment Details
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Payment Status</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      order.paymentStatus === "PAID"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
                {order.razorpayOrderId && (
                  <div>
                    <span className="text-xs text-slate-500 block">Razorpay Order ID</span>
                    <span className="font-mono text-xs text-slate-800 break-all">
                      {order.razorpayOrderId}
                    </span>
                  </div>
                )}
                {order.razorpayPaymentId && (
                  <div>
                    <span className="text-xs text-slate-500 block">Razorpay Payment ID</span>
                    <span className="font-mono text-xs text-slate-800 break-all">
                      {order.razorpayPaymentId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
