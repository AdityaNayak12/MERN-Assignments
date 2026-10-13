import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../axiosCalls/axios.js";
import { formatPrice, getStockLabel } from "../services/productApi.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const { checkAuth } = useAuth();

  const fetchWishlist = () => {
    setIsLoading(true);
    setError("");
    axiosInstance
      .get("/wishlist")
      .then((res) => {
        setWishlist(res.data.wishlist || []);
      })
      .catch(() => {
        setError("Unable to load wishlist.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = (productId) => {
    axiosInstance
      .delete(`/wishlist/${productId}`)
      .then(() => {
        setWishlist((prev) => prev.filter((item) => item._id !== productId));
        checkAuth();
      })
      .catch(() => {
        alert("Failed to remove product from wishlist");
      });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-4 py-10 text-slate-900">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-lg text-slate-600">Loading your wishlist...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-4 py-10 text-slate-900">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchWishlist}
            className="rounded-xl bg-amber-300 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-200"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (wishlist.length === 0) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-4 py-20 text-slate-900">
        <div className="mx-auto max-w-7xl text-center">
          <div className="text-6xl mb-6">❤️</div>
          <h1 className="text-3xl font-semibold mb-4 text-slate-950">Your wishlist is empty</h1>
          <p className="text-lg text-slate-600 mb-8">
            Save products you love and find them here later.
          </p>
          <Link
            to="/products"
            className="rounded-xl bg-amber-300 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-6 text-slate-900 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-semibold mb-2">My Wishlist</h1>
        <p className="text-slate-600 mb-8">{wishlist.length} products saved</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((product) => (
            <article
              key={product._id}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                alt={product.name}
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
                src={product.image}
              />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.16em] text-amber-700 uppercase">
                      {product.category}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                      {product.name}
                    </h2>
                  </div>
                  <p className="shrink-0 text-lg font-bold text-slate-950">
                    {formatPrice(product.price)}
                  </p>
                </div>
                <p
                  className={`mt-4 text-sm font-semibold ${
                    product.stock > 0 ? "text-emerald-700" : "text-slate-500"
                  }`}
                >
                  {getStockLabel(product.stock)}
                </p>
                <div className="mt-auto pt-6 flex gap-4">
                  <Link
                    className="text-sm font-semibold text-amber-700 underline decoration-amber-300 underline-offset-4 hover:text-amber-800"
                    to={`/products/${product._id}`}
                  >
                    View details
                  </Link>
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="text-sm font-semibold text-red-600 hover:text-red-800 underline decoration-red-300 underline-offset-4"
                  >
                    Remove ❤️
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
