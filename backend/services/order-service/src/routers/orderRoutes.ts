import express from "express";
import OrderController from "../controllers/orderController";
const orderRoute = express.Router();

const orederController = new OrderController();

orderRoute
  .route("/createOrder")
  .post(orederController.createOrder.bind(orederController));

export default orderRoute;
