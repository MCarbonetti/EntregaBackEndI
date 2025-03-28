import { Router } from "express";
import Cart from "../dao/models/Cart.js";

const router = Router();


router.delete("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

    cart.products = cart.products.filter(product => product.product.toString() !== pid);
    await cart.save();
    res.json({ status: "success", message: "Producto eliminado del carrito" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});


router.put("/:cid", async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body;

  try {
    const cart = await Cart.findByIdAndUpdate(cid, { products }, { new: true });
    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});


router.put("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

    const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
    if (productIndex === -1) return res.status(404).json({ status: "error", message: "Producto no encontrado" });

    cart.products[productIndex].quantity = quantity;
    await cart.save();
    res.json({ status: "success", message: "Cantidad actualizada", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});


router.delete("/:cid", async (req, res) => {
  try {
    await Cart.findByIdAndUpdate(req.params.cid, { products: [] });
    res.json({ status: "success", message: "Carrito vaciado" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;
