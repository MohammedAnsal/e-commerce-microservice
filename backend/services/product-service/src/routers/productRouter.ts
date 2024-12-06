import express from "express";
import ProductController from "../controllers/productController";
const productRouter = express.Router();
const productController = new ProductController();

productRouter
  .route("/addProduct")
  .post(productController.addProduct.bind(productController));
productRouter
  .route("/editProduct/:id")
  .put(productController.editProduct.bind(productController));

productRouter
  .route("/deleteProduct/:id")
  .delete(productController.deleteProduct.bind(productController));

export default productRouter;
