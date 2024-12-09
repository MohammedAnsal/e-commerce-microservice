import express from "express";
import CartController from "../controllers/cartController";
const cartRouter = express.Router();

const cartController = new CartController();

cartRouter.route("/addCart").post(cartController.addCart.bind(cartController));
cartRouter.route("/getCart").get(cartController.getCart.bind(cartController));
cartRouter
  .route("/removeCart")
  .put(cartController.removeCart.bind(cartController));

export default cartRouter;
