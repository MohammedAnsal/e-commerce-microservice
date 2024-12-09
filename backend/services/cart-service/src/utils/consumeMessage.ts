import processData from "../kafka/proccessData";
import Cart from "../models/cartModel";
import ICart from "../types/interface/ICart";

const consumeMessage = () => {
  processData<ICart>("Order-Topic-cart", "cart_group", Cart);
};

export default consumeMessage;
