import { Document } from "mongoose";

export default interface ProductType extends Document {
  name: String;
  description: String;
  price: Number;
  stock: Number;
}
