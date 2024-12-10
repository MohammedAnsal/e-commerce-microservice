import processData from "../kafka/proccesData";
import Cart from "../models/cartModel";
import Product from "../models/productModel";
import ICart from "../types/interface/ICart";
import IProduct from "../types/interface/IProduct";

const consumeMessage = () => {
  processData<ICart>("Order-Topic-cart", "cart_group", Cart);
  processData<IProduct>("Product-Topic", "product_group", Product);
};

export default consumeMessage;
