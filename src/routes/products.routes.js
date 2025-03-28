import { Router } from "express";
import Product from "../dao/models/Product.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, query, sort } = req.query;

   
    let filter = {};
    if (query) {
      const [key, value] = query.split(":");
      filter[key] = value;
    }

    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sort ? { price: sort === "asc" ? 1 : -1 } : undefined,
      lean: true,
    };

    
    const result = await Product.paginate(filter, options);

   
    res.json({
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}` : null,
      nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}` : null,
    });

  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;
