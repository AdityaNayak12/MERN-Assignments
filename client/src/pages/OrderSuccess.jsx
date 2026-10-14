import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrderByIdApi } from "../services/orderApi.js";
import { formatPrice } from "../services/productApi.js";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    async function fetchOrder() {
      try {
        setLoading(true);
        const data = await getOrderByIdApi(id);
        if (!ignore) setOrder(data);
      } catch (err) {
        if (!ignore) {
          setError(err?.response?.data?.message || "Unable to fetch order details.");
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-4 py-20 text-slate-900">
        <div className="mx-auto max-w-lg text-center">
          <p className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
            Loading order confirmation...
          </p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-4 py-20 text-slate-900">
        <div className="mx-auto max-w-lg text-center">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
            <h1 className="text-xl font-bold text-red-800 mb-2">Order Not Found</h1>
            <p className="text-sm text-red-600 mb-6">{error || "Could not retrieve order details."}</p>
            <Link
              to="/orders"
              className="inline-block rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to My Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-12 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-3xl">
          ✓
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 mb-2">
          Order Placed Successfully
        </h1>
        <p className="text-sm text-slate-600 mb-8">
          Your order has been verified and saved successfully.
        </p>

        <div className="rounded-xl bg-slate-50 border border-slate-100 p-6 text-left mb-8 space-y-3 text-sm">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="text-slate-500">Order ID</span>
            <span className="font-mono font-medium text-slate-900">{order._id}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="text-slate-500">Total Amount</span>
            <span className="font-bold text-slate-950 text-base">{formatPrice(order.totalAmount)}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="text-slate-500">Payment Status</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              {order.paymentStatus}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="text-slate-500">Order Status</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {order.status}
            </span>
          </div>

          {order.shippingAddress && (
            <div className="pt-2">
              <span className="text-slate-500 block mb-1">Delivering to</span>
              <p className="font-medium text-slate-900">
                {order.shippingAddress.fullName} ({order.shippingAddress.phone})
              </p>
              <p className="text-slate-600 text-xs">
                {order.shippingAddress.addressLine1}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
            </div>
          )}
        </div>

        {/* Ordered items preview */}
        <div className="text-left mb-8">
          <h2 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
            Items Ordered ({order.items?.length || 0})
          </h2>
          <div className="space-y-3">
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                </div>
                <span className="font-medium text-slate-800">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/orders"
            className="w-full sm:w-auto rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 text-center shadow-sm"
          >
            View My Orders
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto rounded-xl bg-amber-300 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200 text-center shadow-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
