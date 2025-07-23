"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const DUMMY_PRODUCTS = [
  {
    id: 1,
    name: "Professional Commercial Safety Equipment",
    price: 112.0,
    image: "https://images.unsplash.com/photo-1581093458791-9f3c3250e5bb?w=300&h=250&fit=crop",
  },
  {
    id: 2,
    name: "Plastic Geek RX Safety Glasses",
    price: 24.55,
    image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=300&h=250&fit=crop",
  },
  {
    id: 3,
    name: "Angel Garage Door",
    price: 112.0,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=250&fit=crop",
  },
  {
    id: 4,
    name: "Spider Hoodie",
    price: 1.0,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=250&fit=crop",
  },
];

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    city: "",
    postal: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const found = DUMMY_PRODUCTS.find((p) => p.id === Number(id));
    setProduct(found);
  }, [id]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOrder = async (e: any) => {
    e.preventDefault();
    if (!product) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          productPrice: product.price,
          buyerName: form.name,
          address: form.address,
          phone: form.phone,
          city: form.city,
          postal: form.postal,
        }),
      });
      if (res.ok) {
        alert("Order placed successfully!");
        router.push("/dashboard/market");
      } else {
        const data = await res.json();
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (!product) return <div className="p-8">Product not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      <div className="flex gap-6 mb-6">
        <img src={product.image} alt={product.name} className="w-32 h-32 object-cover rounded" />
        <div>
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-xl font-bold text-blue-600">${product.price.toFixed(2)}</p>
        </div>
      </div>
      <form onSubmit={handleOrder} className="space-y-4">
        <input
          name="name"
          required
          placeholder="Full Name"
          className="w-full p-2 border rounded"
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="address"
          required
          placeholder="Delivery Address"
          className="w-full p-2 border rounded"
          value={form.address}
          onChange={handleChange}
        />
        <input
          name="city"
          required
          placeholder="City"
          className="w-full p-2 border rounded"
          value={form.city}
          onChange={handleChange}
        />
        <input
          name="postal"
          required
          placeholder="Postal Code"
          className="w-full p-2 border rounded"
          value={form.postal}
          onChange={handleChange}
        />
        <input
          name="phone"
          required
          placeholder="Phone Number"
          className="w-full p-2 border rounded"
          value={form.phone}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
} 