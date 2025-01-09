import { input, select, password, Separator } from "@inquirer/prompts";
import chalk from "chalk";
import db from "./db.js";
import {hash, compare} from "bcrypt";
import { onExit, User, createUser } from "./utils.js";

// cause I am used to python
const print = console.log;

type Message = {
 message: string
};

type Choice<Value> = {
  value: Value;
  name?: string;
  description?: string;
  short?: string;
  disabled?: boolean | string;
};

let info: string = "Press Ctrl+C to exit at any time except during databse operations";

print(chalk.bgGreen("Welcome to blog app"));
let choices: Choice<string>[] = [
  {
    value : "create",
    name: "CREATE",
    description: "to create new user"
  },
  {
    value : "login",
    name: "LOGIN",
    description: "to login as a new user"
  },
]; 


try {
  let firstAction: string = await select({
    message: `Do you want to create an account or use an existing one?\n${info}`,
    choices,
  });
  if (firstAction === "create") {
      let user: User = {
        name: await input({ message: "your name: " }),
        password: await password({ message: "your password: " }),
        re_password: await password({ message: "confirm password: " }),
      };
      createUser(user)
    }

}
 catch (error) {
  onExit(error as Error)
}

