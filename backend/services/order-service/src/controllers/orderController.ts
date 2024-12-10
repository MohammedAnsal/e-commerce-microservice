import { Model } from "mongoose";
import MessageBroker from "../utils/messageBroker";
import ICart from "../types/interface/ICart";
import IProduct from "../types/interface/IProduct";
import Cart from "../models/cartModel";
import Product from "../models/productModel";
import { IOrder } from "../types/interface/IOrder";
import Order from "../models/orderModel";
import { AuthRequest } from "../types/api";
import { NextFunction, Response } from "express";
import { Event } from "../types/events";

class OrderController {
  private kafka: MessageBroker;
  private cartModel: Model<ICart>;
  private productModel: Model<IProduct>;
  private orderModel: Model<IOrder>;

  constructor() {
    this.kafka = new MessageBroker();
    this.cartModel = Cart;
    this.productModel = Product;
    this.orderModel = Order;
  }

  async createOrder(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { street, city, state, postalCode, country } = req.body;
      const userId = req.user;

      const cart = await this.cartModel.findOne({ userId });
      console.log(cart);

      if (!cart || cart.items.length == 0) {
        return res.status(400).json({ message: "Cart is empty..." });
      }
      let totalAmount = 0;
      const orderItems = [];
      for (const item of cart.items) {
        const product = (await this.productModel.findById(
          item.productId
        )) as IProduct;
        if (!product)
          return res
            .status(404)
            .json({ message: `Product not found: ${item.productId}` });
        if ((product.stock as number) < item.quantity)
          return res.status(400).json({
            message: `Insufficient stock for product: ${product.name}`,
          });

        product.stock -= item.quantity;
        const updateProduct = await product.save();
        const productPrice = product.price * item.quantity;
        orderItems.push({
          productId: item.productId,
          name: product.name,
          quantity: item.quantity,
          price: productPrice,
        });
        totalAmount += productPrice;
        if (updateProduct) {
          await this.kafka.publish(
            "Order-Topic-Cart",
            { data: updateProduct },
            Event.UPDATE
          );
        }

        const order = await this.orderModel.create({
          userId,
          items: orderItems,
          shippingAddress: { state, street, city, country, postalCode },
          totalAmount,
          paymentMethod: "Cash on Delivery",
          status: "Pending",
        });
        cart.items = [];
        const newCart = await cart.save();

        if (newCart) {
          await this.kafka.publish(
            "Order-Topic-Product",
            { data: newCart },
            Event.UPDATE
          );
          return res
            .status(200)
            .json({ message: "Order Created Successfully", data: order });
        }
      }
    } catch (error) {
      next(error);
    }
  }

  async getSingleOrder(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      const userId = req.user;

      if (!id) {
        return res.status(400).json({ message: "Id Missing.." });
      }

      const getOrder = await this.orderModel
        .findOne({ userId, _id: id })
        .populate("userId")
        .populate("items.productId");
      if (!getOrder) {
        return res.status(400).json({ message: "Order Not Found" });
      }
      res.status(200).json({ message: "Order Found", data: getOrder });
    } catch (error) {
      next(error);
    }
  }

  async getAllOrderds(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const findOrder = await this.orderModel.find();
      if (!findOrder) {
        return res.status(400).json({ message: "There is no order" });
      }
      res.status(200).json({ message: "All Orders", data: findOrder });
    } catch (error) {
      next(error);
    }
  }
}

export default OrderController;
