import { Model } from "mongoose";
import { query, Request, Response } from "express";
import Product, { ProductType } from "../models/productModel";

class ProductController {
  private ProductModel: Model<ProductType>;

  constructor() {
    this.ProductModel = Product;
  }

  async addProduct(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, price, stock } = req.body;

      const exist = await this.ProductModel.findOne({ name: name });

      if (!exist) {
        const newProduct = new this.ProductModel({
          name: name,
          price: price,
          description: description,
          stock: stock,
        });

        await newProduct.save();
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
        console.log(find);

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

        if (updateProduct) {
          res.status(201).json({ message: "Product Updated Successfully..." });
        }
      }
    } catch (error) {
      res.status(400).json({ message: "Somthing Went Wrong..." });
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (id) {
      await this.ProductModel.findByIdAndDelete({ _id: id });

      res.status(200).json({ message: "Product Deleted Successfully..." });
    }

    try {
    } catch (error) {
      res.status(400).json({ message: "Somthing Went Wrong..." });
    }
  }
}

export default ProductController;
