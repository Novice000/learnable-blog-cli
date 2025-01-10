import { input, select, password } from "@inquirer/prompts";
import chalk from "chalk";
import { onExit, createUser } from "./utils.js";
// cause I am used to python
const print = console.log;
let info = "Press Ctrl+C to exit at any time except during databse operations";
print(chalk.bgGreen("Welcome to blog app"));
let initialChoices = [
    {
        value: "create",
        name: "CREATE",
        description: "to create new user"
    },
    {
        value: "login",
        name: "LOGIN",
        description: "to login as a new user"
    },
];
try {
    let firstAction = await select({
        message: `Do you want to create an account or use an existing one?\n${info}`,
        choices,
    });
    if (firstAction === "create") {
        let user = {
            name: await input({ message: "your name: " }),
            password: await password({ message: "your password: " }),
            re_password: await password({ message: "confirm password: " }),
        };
        createUser(user);
    }
}
catch (error) {
    onExit(error);
}
