import express from "express";
import OrderController from "../controllers/orderController";
const orderRoute = express.Router();

const orederController = new OrderController();

orderRoute
  .route("/createOrder")
  .post(orederController.createOrder.bind(orederController));

orderRoute
  .route("/get-single-order/:id")
  .get(orederController.getSingleOrder.bind(orederController));

orderRoute
  .route("/getAllOrders")
  .get(orederController.getAllOrderds.bind(orederController));

export default orderRoute;
