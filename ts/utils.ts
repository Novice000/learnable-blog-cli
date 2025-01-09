import chalk from "chalk";
import * as bcrypt from "bcrypt";
import db from "./db.js";

const rounds: number = 123

type userInstance = {
  id: number;
  name: string;
  passowrd: string;
}

type postInstance = {
  id: number;
  user_id: number;
  title: string;
  post: string;
}

type User = {
  name: string;
  password: string;
  re_password?: string;
};


function checkPassword(person: User): boolean {
  return person.password.trim() === person.re_password?.trim();
}


function onExit(error: Error, message: string | null = null): void {
  if (error instanceof Error && error.name === "ExitPromptError") {
    if (message == null) {
      chalk.red;
    }
    // noop; silence this error
  } else {
    throw error;
  }
};


async function createUser(person:User): Promise<void>{
  console.log("creating user")
  if(person.password.toLowerCase() === person.re_password?.toLowerCase()){
    console.log("in here")
    let name: string = person.name.toLocaleLowerCase();  
    console.log("in here 2")
    // check if the user exists
    const user: unknown[] = db.prepare("SELECT * FROM users WHERE name = ?").all(name);
    console.log("in here 3")
    // if not create a new user
      if (user.length == 0) {
        let hashedPassword = await bcrypt.hash(person.password, rounds);
        let create = db.prepare(
          "INSERT INTO users (name, password) VALUES (?,?)"
        );
        create.run(name, hashedPassword);
        console.log("user created")
      } 
    // if user does console.log that the user exists
      else {
        console.log("user already exists");
      }
  } else {
    console.log("password does not match")
  }
}


function loginUser(person:User){
    let name = person.name.toLocaleLowerCase()
    let password = bcrypt.hash(person.password, rounds)
    let search = db.prepare("SELECT * FROM users WHERE name = ? AND password = ?")
    let searchResult = search.all(name, password) as userInstance[]
    if (searchResult.length === 0) {
      console.log("user doesn't exist")
    }
    else if(searchResult.length === 1) {
      return searchResult[0]
    } 
}


function createPost(name: string,title: string, post: string): void{
  const getUser = db.prepare("SELECT * FROM users WHERE name = ?")
  const user = getUser.get(name) as userInstance
  const createPost = db.prepare("INSER INTO posts (user_id, title, post) VALUES (?,?,?)")
  createPost.run(user.id, title, post)
  console.log(chalk.green("post created"))
}


function DeletePost(user_id: number, id: number) :void{
  const removePost = db.prepare("DELETE FROM posts where id = ? AND user_id = ?")
  removePost.run(id)
}

function viewPost(post: postInstance): void{
  console.log(
    chalk.bgBlackBright(`
    ${chalk.blue("POST ID")}: ${post.id}\n
    ${chalk.blue("TITLE")}: ${post.title}\n
    ${chalk.blue("POST")}: ${post.post}\n\n\n
    `)
  );
}


export {User, checkPassword, onExit, loginUser, createUser, DeletePost, createPost, viewPost}