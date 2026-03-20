"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CartItem, Material } from "./types";

type CartContextType = {
  items: CartItem[];
  addItem: (material: Material, quantity: number) => void;
  updateQuantity: (materialId: string, quantity: number) => void;
  removeItem: (materialId: string) => void;
  clearCart: () => void;
  totalItems: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((material: Material, quantity: number) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.material.id === material.id);
      if (existing) {
        return prev.map((item) =>
          item.material.id === material.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { material, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((materialId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.material.id === materialId ? { ...item, quantity } : item
      )
    );
  }, []);

  const removeItem = useCallback((materialId: string) => {
    setItems((prev) => prev.filter((item) => item.material.id !== materialId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clearCart, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
