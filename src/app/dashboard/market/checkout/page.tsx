"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image?: string;
  imageUrl?: string;
  quantity: number;
}

const USER_BALANCE = 100; // Simulated user balance

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    country: "",
    city: "",
    zip: "",
    address: "",
  });
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [showFAB, setShowFAB] = useState(true);

  useEffect(() => {
    // Load cart from localStorage
    const stored = localStorage.getItem("cart");
    if (stored) {
      setCart(JSON.parse(stored));
    }
    // Load addresses from localStorage
    const addr = localStorage.getItem("addresses");
    if (addr) {
      setAddresses(JSON.parse(addr));
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage on change
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("addresses", JSON.stringify(addresses));
  }, [addresses]);

  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handleAddAddress = (e: any) => {
    e.preventDefault();
    setAddresses(prev => [...prev, addressForm]);
    setAddressForm({ name: "", phone: "", country: "", city: "", zip: "", address: "" });
    setSelectedAddress(addresses.length); // select the new address
  };

  const handleQty = (idx: number, delta: number) => {
    setCart(prev => prev.map((item, i) => i === idx ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const handleRemove = (idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleOrder = async (e: any) => {
    e.preventDefault();
    setOrderError(null);
    if (total > USER_BALANCE) {
      setOrderError("You don't have enough balance to purchase, please top up your wallet.");
      return;
    }
    if (selectedAddress === null) {
      setOrderError("Please select or add a delivery address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          address: addresses[selectedAddress],
          total,
        }),
      });
      if (res.ok) {
        alert("Order placed successfully!");
        setCart([]);
        localStorage.removeItem("cart");
        router.push("/dashboard/market");
      } else {
        const data = await res.json();
        setOrderError(data.error || "Order failed");
      }
    } catch (err) {
      setOrderError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 mt-4 ml-4">Checkout</h1>
      <div className="flex flex-col md:flex-row max-w-6xl mx-auto gap-8">
        {/* Address Section */}
        <div className="flex-1 bg-white rounded-lg shadow p-6 mb-6 md:mb-0">
          <div className="mb-4">
            <div className="font-semibold mb-2">Delivery Address</div>
            {addresses.length === 0 && (
              <div className="bg-gray-100 text-gray-600 p-2 rounded mb-2 text-sm">Please add a new address below to continue</div>
            )}
            {addresses.length > 0 && (
              <div className="mb-4">
                {addresses.map((addr, idx) => (
                  <div key={idx} className={`p-2 rounded border mb-2 flex items-center gap-2 ${selectedAddress === idx ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input type="radio" checked={selectedAddress === idx} onChange={() => setSelectedAddress(idx)} />
                    <div>
                      <div className="font-medium">{addr.name}</div>
                      <div className="text-xs text-gray-500">{addr.address}, {addr.city}, {addr.country}, {addr.zip}</div>
                      <div className="text-xs text-gray-400">{addr.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="font-semibold mb-2">Add New Address</div>
          <form onSubmit={handleAddAddress} className="space-y-2">
            <input
              name="name"
              required
              placeholder="Name"
              className="w-full p-2 border rounded"
              value={addressForm.name}
              onChange={handleAddressFormChange}
            />
            <div className="flex gap-2">
              <input
                name="phone"
                required
                placeholder="Phone"
                className="w-1/2 p-2 border rounded"
                value={addressForm.phone}
                onChange={handleAddressFormChange}
              />
              <input
                name="country"
                required
                placeholder="Country"
                className="w-1/2 p-2 border rounded"
                value={addressForm.country}
                onChange={handleAddressFormChange}
              />
            </div>
            <div className="flex gap-2">
              <input
                name="city"
                required
                placeholder="City"
                className="w-1/2 p-2 border rounded"
                value={addressForm.city}
                onChange={handleAddressFormChange}
              />
              <input
                name="zip"
                required
                placeholder="Zip Code"
                className="w-1/2 p-2 border rounded"
                value={addressForm.zip}
                onChange={handleAddressFormChange}
              />
            </div>
            <textarea
              name="address"
              required
              placeholder="Address"
              className="w-full p-2 border rounded"
              value={addressForm.address}
              onChange={handleAddressFormChange}
            />
            <button type="submit" className="w-full bg-cyan-600 text-white py-2 rounded font-semibold hover:bg-cyan-700">Add</button>
          </form>
        </div>
        {/* Cart Section */}
        <div className="w-full md:w-[420px] bg-white rounded-lg shadow p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span role="img" aria-label="cart">🛒</span> Shopping Cart
            </h2>
            <button className="text-blue-600 text-sm" onClick={() => router.push('/dashboard/market')}>&larr; Back to shop</button>
          </div>
          <div className="mb-4 text-gray-500 text-sm">{cart.length} Item{cart.length !== 1 ? 's' : ''}</div>
          {cart.length === 0 ? (
            <div className="text-gray-500">Your cart is empty.</div>
          ) : (
            <ul className="space-y-4">
              {cart.map((item, idx) => (
                <li key={item.id} className="flex gap-4 items-center border-b pb-2">
                  <img src={item.imageUrl || item.image} alt={item.name} className="h-16 w-16 object-cover rounded" />
                  <div className="flex-1">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-blue-600 font-bold">${item.price}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs">Qty</span>
                      <button type="button" className="px-2 py-1 bg-gray-200 rounded" onClick={() => handleQty(idx, -1)}>-</button>
                      <span className="px-2">{item.quantity}</span>
                      <button type="button" className="px-2 py-1 bg-gray-200 rounded" onClick={() => handleQty(idx, 1)}>+</button>
                    </div>
                  </div>
                  <button type="button" className="text-gray-400 hover:text-red-600 text-2xl" onClick={() => handleRemove(idx)}>
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex items-center justify-between">
            <span className="font-bold text-lg">Total:</span>
            <span className="font-bold text-2xl text-blue-700">${total.toFixed(2)}</span>
          </div>
          {orderError && (
            <div className="bg-red-100 text-red-700 p-2 rounded mt-4 text-center text-sm">{orderError}</div>
          )}
          {total > USER_BALANCE && (
            <div className="bg-red-100 text-red-700 p-2 rounded mt-4 text-center text-sm">
              You don't have enough balance to purchase, please top up your wallet.
            </div>
          )}
        </div>
      </div>
      {/* Floating Action Button */}
      {showFAB && (
        <button
          className="fixed bottom-6 right-6 w-14 h-14 bg-cyan-600 text-white rounded-full shadow-lg hover:bg-cyan-700 transition-colors flex items-center justify-center z-50"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
} 