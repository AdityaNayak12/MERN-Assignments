import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../services/productApi.js";
import {
  createPaymentOrderApi,
  loadRazorpayScript,
  validateShippingForm,
  verifyPaymentApi,
} from "../services/orderApi.js";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, subtotal, clearCart, isLoading: cartLoading } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [paymentNotice, setPaymentNotice] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setApiError("");
    setPaymentNotice("");

    // Step 1: Validate client side form
    const validation = validateShippingForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 2: Call backend to validate stock, prices and create pending order + Razorpay order
      const paymentOrderData = await createPaymentOrderApi(formData);
      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = paymentOrderData;

      // Step 3: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || typeof window.Razorpay === "undefined") {
        // Fallback for offline environments or blocked scripts: simulate test mode payment
        setPaymentNotice("Razorpay checkout script could not be loaded online. Simulating Test Mode verification...");
        const simulatedPaymentId = `pay_sim_${Math.random().toString(36).substring(2, 10)}`;
        
        // Compute test signature on backend or test endpoint
        const verifyRes = await verifyPaymentApi({
          shopKartOrderId,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: simulatedPaymentId,
          razorpay_signature: "simulated_test_signature",
        }).catch(async () => {
          // If server rejects test signature, let user know real key is required or use backend signature
          throw new Error("Razorpay script not available. Please ensure internet access to load Razorpay checkout.");
        });

        clearCart();
        navigate(`/order-success/${verifyRes.order._id}`);
        return;
      }

      // Step 4: Open Razorpay Checkout modal
      const options = {
        key: key || "rzp_test_placeholder",
        amount: amount,
        currency: currency || "INR",
        name: "ShopKart",
        description: "Order Checkout",
        order_id: razorpayOrderId,
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
        },
        handler: async function (response) {
          try {
            setPaymentNotice("Verifying payment with server...");
            const verificationRes = await verifyPaymentApi({
              shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Clear global cart state and navigate to order success
            clearCart();
            navigate(`/order-success/${verificationRes.order._id}`);
          } catch (verifyErr) {
            setApiError(
              verifyErr?.response?.data?.message ||
                "Payment verification failed. Your cart has been preserved."
            );
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setPaymentNotice("Payment was cancelled. Your cart has not been modified.");
          },
        },
        theme: {
          color: "#0f172a",
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (response) {
        setApiError(`Payment failed: ${response.error?.description || "Transaction declined"}. Your cart remains unchanged.`);
        setIsSubmitting(false);
      });

      razorpayInstance.open();
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "An unexpected error occurred while placing order.";
      setApiError(errMsg);
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-4 py-16 text-slate-900">
        <div className="mx-auto max-w-2xl text-center">
          <p className="rounded-2xl border border-slate-200 bg-white p-8 text-lg text-slate-600 shadow-sm">
            Loading checkout...
          </p>
        </div>
      </main>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-4 py-20 text-slate-900">
        <div className="mx-auto max-w-md text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="text-3xl font-semibold mb-3 text-slate-950">Your cart is empty</h1>
          <p className="text-base text-slate-600 mb-8">
            You cannot proceed to checkout with an empty cart.
          </p>
          <Link
            to="/products"
            className="inline-block rounded-xl bg-amber-300 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-amber-200 shadow-sm"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-6 text-slate-900 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <Link
            to="/cart"
            className="text-sm font-semibold text-amber-700 hover:text-amber-800 transition mb-2 inline-block"
          >
            ← Back to Cart
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Checkout
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Complete your shipping details to place your order with Razorpay Test Mode.
          </p>
        </div>

        {apiError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <span className="font-semibold">Error:</span> {apiError}
          </div>
        )}

        {paymentNotice && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            {paymentNotice}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Shipping Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 mb-6 border-b border-slate-100 pb-4">
              Shipping Details
            </h2>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Aarav Sharma"
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none ${
                    errors.fullName
                      ? "border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                      : "border-slate-300 focus:border-slate-900"
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none ${
                    errors.phone
                      ? "border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                      : "border-slate-300 focus:border-slate-900"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="e.g. Flat 402, Sunshine Apartments"
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none ${
                    errors.addressLine1
                      ? "border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                      : "border-slate-300 focus:border-slate-900"
                  }`}
                />
                {errors.addressLine1 && (
                  <p className="mt-1 text-xs text-red-600">{errors.addressLine1}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none ${
                      errors.city
                        ? "border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                        : "border-slate-300 focus:border-slate-900"
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-600">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Karnataka"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none ${
                      errors.state
                        ? "border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                        : "border-slate-300 focus:border-slate-900"
                    }`}
                  />
                  {errors.state && (
                    <p className="mt-1 text-xs text-red-600">{errors.state}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 560001"
                  maxLength={6}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none ${
                    errors.pincode
                      ? "border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                      : "border-slate-300 focus:border-slate-900"
                  }`}
                />
                {errors.pincode && (
                  <p className="mt-1 text-xs text-red-600">{errors.pincode}</p>
                )}
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm sticky top-6">
            <h2 className="text-xl font-bold text-slate-950 mb-6 border-b border-slate-100 pb-4">
              Order Summary
            </h2>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {cartItems.map((item) => {
                const product = item.product || {};
                const name = product.name || "Product";
                const price = product.price || 0;
                const qty = item.quantity || 1;
                const itemTotal = price * qty;

                return (
                  <div
                    key={(product._id || Math.random()).toString()}
                    className="flex justify-between items-center text-sm py-2 border-b border-slate-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={name}
                          className="h-10 w-10 object-cover rounded-lg border border-slate-200"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-slate-900 leading-tight">
                          {name}
                        </p>
                        <p className="text-xs text-slate-500">Qty: {qty}</p>
                      </div>
                    </div>
                    <span className="font-medium text-slate-900">
                      {formatPrice(itemTotal)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border-t border-slate-200 pt-4 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-700">Free</span>
              </div>
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-base font-semibold text-slate-900">Total</span>
                <span className="text-2xl font-bold text-slate-950">
                  {formatPrice(subtotal)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Processing Payment...</span>
                </>
              ) : (
                <span>Place Order</span>
              )}
            </button>

            <p className="mt-3 text-center text-xs text-slate-500">
              Razorpay Test Mode • No actual currency will be debited
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
