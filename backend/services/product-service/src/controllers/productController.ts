import { Model } from "mongoose";
import { Request, Response } from "express";
import Product from "../models/productModel";
import { ProductType } from "../types/interface/IProduct";
import MessageBroker from "../utils/messageBroker";
import { ProductEvent } from "../types/kafkaType";

class ProductController {
  private ProductModel: Model<ProductType>;
  private kafka: MessageBroker;

  constructor() {
    this.ProductModel = Product;
    this.kafka = new MessageBroker();
  }

  async addProduct(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, price, stock } = req.body;

      if (!name || !description || !price || !stock)
        throw new Error("Please fill all the instructions...");

      const exist = await this.ProductModel.findOne({ name });

      if (!exist) {
        const newProduct = await this.ProductModel.create({
          name: name,
          price: price,
          description: description,
          stock: stock,
        });

        try {
          await this.kafka.publish(
            "Product-Topic",
            { data: newProduct },
            ProductEvent.CREATE
          );
        } catch (kafkaError) {
          console.error("Kafka publish failed:", kafkaError);
          throw new Error("Failed to publish Kafka event");
        }

        res.status(201).json({ message: "Product Added Success..." });
      } else {
        res.status(401).json({ message: "Product Already Exist..." });
      }
    } catch (error: any) {
      res.status(400).json({ message: "Somthing Went Wrong..." });
    }
  }

  async editProduct(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, price, stock } = req.body;
      const { id } = req.params;

      const find = await this.ProductModel.findOne({ _id: id });

      if (find) {
        const updateProduct = await this.ProductModel.findByIdAndUpdate(
          { _id: find._id },
          {
            $set: {
              name: name,
              description: description,
              price: price,
              stock: stock,
            },
          }
        );

        await this.kafka.publish(
          "Product-Topic",
          { data: updateProduct },
          ProductEvent.UPDATE
        );

        if (updateProduct) {
          res.status(201).json({ message: "Product Updated Successfully..." });
        }
      }
    } catch (error) {
      res.status(400).json({ message: "Somthing Went Wrong..." });
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (id) {
        const deleteProduct = await this.ProductModel.findByIdAndDelete(id);

        if (deleteProduct) {
          await this.kafka.publish(
            "Product-Topic",
            { data: deleteProduct },
            ProductEvent.UPDATE
          );
          res.status(200).json({ message: "Product Deleted Successfully..." });
        }
      }
    } catch (error) {
      res.status(400).json({ message: "Somthing Went Wrong..." });
    }
  }
}

export default ProductController;
