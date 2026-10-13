import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { axiosInstance } from "../axiosCalls/axios.js";

export default function Navbar() {
  const { user } = useAuth();
  const { cartCount } = useCart();

  if (!user) return null;

  const wishlistCount = user.wishlist ? user.wishlist.length : 0;

  return (
    <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
      <div className="font-bold text-xl tracking-wider text-amber-300">
        <Link to="/home">ShopKart</Link>
      </div>
      <ul className="flex gap-6 items-center">
        <li>
          <Link to="/home" className="hover:text-amber-300 transition">Home</Link>
        </li>
        <li>
          <Link to="/products" className="hover:text-amber-300 transition">Products</Link>
        </li>
        <li>
          <Link to="/wishlist" className="hover:text-amber-300 transition">
            Wishlist ({wishlistCount})
          </Link>
        </li>
        <li>
          <Link to="/cart" className="hover:text-amber-300 transition">
            Cart ({cartCount})
          </Link>
        </li>
        <li>
          <button
            onClick={async () => {
              try {
                await axiosInstance.post("/user/logout");
                window.location.href = "/login";
              } catch (e) {
                console.error(e);
              }
            }}
            className="hover:text-red-400 transition cursor-pointer"
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}
