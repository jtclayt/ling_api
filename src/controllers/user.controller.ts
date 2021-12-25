import { Request, Response } from "express";
import { sign } from "jsonwebtoken";

import { App } from "../app";
import { User } from "../models/user.model";

export const userController = () => {
  // Registration logic
  App.instance.post("/register", async (req: Request, res: Response) => {
    console.log(req.body);
    const { userName, firstName, lastName, password, checkPassword } = req.body;

    if (!(userName && password && checkPassword)) {
      res.status(400).send("Username, password, and confirm password fields required");
    } else if (password !== checkPassword) {
      res.status(400).send("Passwords do not match")
    } else if (await User.findOne({ where: { userName: userName  }})) {
      return res.status(409).send("User already exists, please provide unique username or login");
    }

    const passwordHash = User.hashPassword(password);

    try {
      const user = await User.create({
        userName: userName,
        firstName: firstName || null,
        lastName: lastName || null,
        passwordHash: passwordHash
      });
      user.token = sign(
        { userId: user.id, userName: userName },
        process.env.TOKEN_KEY as string,
        {
          expiresIn: "2h",
        }
      );
      res.status(201).send(user);
    } catch (error) {
      console.log(`Registration error: ${error}`);
      res.status(500).send("Error occurred during registration, please try again");
    }
  });

  // Login logic
  App.instance.post("/login", async (req: Request, res: Response) => {
    const { userName, password } = req.body;

    try {
      const user = await User.findOne({ where: { userName: userName }});

      if (user?.checkPassword(password)) {
        user.token = sign(
          { userId: user.id, userName: userName },
          process.env.TOKEN_KEY as string,
          {
            expiresIn: "2h",
          }
        );
        res.status(200).send(user);
      } else {
        res.status(401).send("Invalid login credentials");
      }
    } catch (error) {
      console.log(`Login error: ${error}`);
      res.status(500).send("Error occured during login, please try again");
    }
  });
}
