import chalk from "chalk";
import * as bcrypt from "bcrypt";
import db from "./db.js";
const rounds = 5;
function checkPassword(person) {
    return person.password.trim() === person.re_password?.trim();
}
function onExit(error, message = null) {
    if (error instanceof Error && error.name === "ExitPromptError") {
        if (message == null) {
            chalk.red;
        }
        // noop; silence this error
    }
    else {
        throw error;
    }
}
;
async function createUser(person) {
    console.log("creating user");
    if (person.password.toLowerCase() === person.re_password?.toLowerCase()) {
        console.log("in here");
        let name = person.name.toLocaleLowerCase();
        console.log("in here 2");
        // check if the user exists
        const user = db.prepare("SELECT * FROM users WHERE name = ?").all(name);
        console.log("in here 3");
        // if not create a new user
        if (user.length == 0) {
            console.log("in here 4");
            let hashedPassword = await bcrypt.hash(person.password, rounds);
            console.log("in here 5");
            let create = db.prepare("INSERT INTO users (name, password) VALUES (?,?)");
            console.log("in here 6");
            create.run(name, hashedPassword);
            console.log("in here 7");
            console.log("user created");
        }
        // if user does console.log that the user exists
        else {
            console.log("user already exists");
        }
    }
    else {
        console.log("password does not match");
    }
}
function loginUser(person) {
    let name = person.name.toLocaleLowerCase();
    let password = bcrypt.hash(person.password, rounds);
    let search = db.prepare("SELECT * FROM users WHERE name = ? AND password = ?");
    let searchResult = search.all(name, password);
    if (searchResult.length === 0) {
        console.log("user doesn't exist");
    }
    else if (searchResult.length === 1) {
        return searchResult[0];
    }
}
function createPost(name, title, post) {
    const getUser = db.prepare("SELECT * FROM users WHERE name = ?");
    const user = getUser.get(name);
    const createPost = db.prepare("INSER INTO posts (user_id, title, post) VALUES (?,?,?)");
    createPost.run(user.id, title, post);
    console.log(chalk.green("post created"));
}
function DeletePost(user_id, id) {
    const removePost = db.prepare("DELETE FROM posts where id = ? AND user_id = ?");
    removePost.run(id);
}
function viewPost(post) {
    console.log(chalk.bgBlackBright(`
    ${chalk.blue("POST ID")}: ${post.id}\n
    ${chalk.blue("TITLE")}: ${post.title}\n
    ${chalk.blue("POST")}: ${post.post}\n\n\n
    `));
}
export { checkPassword, onExit, loginUser, createUser, DeletePost, createPost, viewPost };
