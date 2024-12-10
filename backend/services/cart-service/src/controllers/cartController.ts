import { Response } from "express";
import { AuthRequest } from "../types/api";
import { Model, Types } from "mongoose";
import IProduct from "../types/interface/IProduct";
import ICart from "../types/interface/ICart";
import Product from "../models/productModel";
import Cart from "../models/cartModel";
import MessageBroker from "../utils/messageBroker";
import { Event } from "../types/events";

class CartController {
  private productModel: Model<IProduct>;
  private cartModel: Model<ICart>;
  private kafka: MessageBroker;

  constructor() {
    this.productModel = Product;
    this.cartModel = Cart;
    this.kafka = new MessageBroker();
  }

  async addCart(req: AuthRequest, res: Response): Promise<any> {
    try {
      const { id, quantity } = req.body;

      if (!id || !quantity) {
        return res
          .status(400)
          .json({ message: "Product ID and Quantity are required" });
      }

      const objectId = new Types.ObjectId(id);

      const product = await this.productModel.findById(objectId);

      if (!product) {
        return res.status(400).json({ message: "Product Not Found" });
      }

      const userId = req.user;

      const updateCart = await this.cartModel.findOneAndUpdate(
        { userId: userId, "items.productId": id },
        { $set: { "items.$.quantity": quantity } },
        { new: true }
      );

      if (updateCart) {
        await this.kafka.publish(
          "Cart-Topic",
          { data: updateCart },
          Event.UPDATE
        );
        return res
          .status(200)
          .json({ message: "Product Update in cart", data: updateCart });
      } else {
        const newCart = await this.cartModel.findOneAndUpdate(
          { userId },
          { $push: { items: { productId: id, quantity: quantity } } },
          { new: true, upsert: true }
        );

        await this.kafka.publish("Cart-Topic", { data: newCart }, Event.UPSERT);
        return res
          .status(200)
          .json({ message: "Product add to the cart", data: newCart });
      }
    } catch (error) {
      console.error("Error in Add Cart:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getCart(req: AuthRequest, res: Response): Promise<any> {
    try {
      const getCart = await this.cartModel
        .findOne({ userId: req.user })
        .populate("items.productId");
      return res.status(200).json({ message: "Cart Found", data: getCart });
    } catch (error) {
      throw new Error("Error Get Cart");
    }
  }

  async removeCart(req: AuthRequest, res: Response): Promise<any> {
    try {
      const { id } = req.body;

      const findProduct = await this.cartModel.findOne({ _id: id });

      console.log(findProduct,'ppppp')

      if (!findProduct) throw new Error("There is no product in cart this id");

      const cartRemove = await this.cartModel.findOneAndUpdate(
        { userId: req.user },
        {
          $pull: {
            items: { productId: id },
          },
        },
        { new: true }
      );
      if (cartRemove) {
        await this.kafka.publish(
          "Cart-Topic",
          { data: cartRemove },
          Event.UPDATE
        );
        return res.status(200).json({ message: "Product Remove Success" });
      }
    } catch (error) {
      console.error("Error in Remove Cart:", error);
    }
  }
}

export default CartController;
