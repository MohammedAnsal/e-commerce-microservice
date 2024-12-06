import { Request, Response, NextFunction } from "express";
import User from "../models/userSchema";
import Jwt from "../utils/jwt";
import bcryptjs from "bcryptjs";
import { Model } from "mongoose";
import { UserType } from "../types/interface/IUser";
import MessageBroker from "../utils/messageBroker";
import { UserEvent } from "../types/kafkaTypes";

class UserController {
  private Jwt: Jwt;
  private UserModel: Model<UserType>;
  private Kafka: MessageBroker;

  constructor() {
    this.Jwt = new Jwt();
    this.UserModel = User;
    this.Kafka = new MessageBroker();
  }

  async registerUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, email, password } = req.body;

      const exist = await this.UserModel.findOne({ email: email });

      if (exist) {
        res.status(400).json({ message: "User Already Exist" });
      } else {
        const hashPassword = await bcryptjs.hash(password, 10);

        const id = (await this.UserModel.countDocuments()) + 100;

        const newUser = new this.UserModel({
          userId: id,
          name: name,
          email: email,
          password: hashPassword,
        });
        //  User Creation Published :-
        await this.Kafka.publish(
          "User-Topic",
          { data: newUser },
          UserEvent.CREATE
        );

        await newUser.save();

        if (newUser) {
          const token = this.Jwt.generateToken(String(newUser._id));
          res
            .status(200)
            .cookie("jwtToken", token, {
              httpOnly: true,
              maxAge: 30 * 24 * 60 * 60 * 1000,
            })
            .json({
              success: true,
              message: "User Successfully Created",
              data: newUser,
              token,
            });
        } else {
          res.status(400).json({ message: "User Not Created" });
        }
      }
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const findUser = await this.UserModel.findOne({ email });

      if (!findUser) {
        res.status(400);
        throw new Error("User Not Found");
      }

      const validPassword = bcryptjs.compareSync(password, findUser.password);

      if (!validPassword) {
        res.status(400).json({ message: "Password Mismatch" });
      }

      const token = this.Jwt.generateToken(findUser._id as string);

      res
        .status(200)
        .cookie("jwtToken", token, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        })
        .json({
          success: true,
          message: "User Login Success",
          data: findUser,
        });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
