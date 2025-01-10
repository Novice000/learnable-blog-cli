import chalk from "chalk";
import * as bcrypt from "bcrypt";
import db from "./db.js";

const rounds: number = 5;

export enum returnValues {
  "user doesn't exist",
  "password doesn't match",
  "user already exists",
  "user created",
  "logged in",
}

export type userInstance = {
  id: number;
  name: string;
  password: string;
};

export type postInstance = {
  readonly id?: number;
  readonly user_id?: number;
  title: string;
  post: string;
};

export type User = {
  name: string;
  password: string;
  re_password?: string;
};

export function checkPassword({ person }: { person: User }): boolean {
  return person.password.trim() === person.re_password?.trim();
}

export function onExit(error: Error, message: string | null = null): void {
  if (error instanceof Error && error.name === "ExitPromptError") {
   console.error(chalk.red(message || "Exiting..."));
   process.exit(1);
  } else {
    throw error;
  }
}

export async function getUser({
  name,
  password,
}: {
  name: string;
  password: string;
}): Promise<userInstance | null> {
  const getUserStatement = db.prepare("SELECT * FROM users WHERE name = ?");
  const user = getUserStatement.get(name) as userInstance | undefined;

  if (!user) {
    return null; // User not found
  }
  // Compare the provided password with the stored hashed password
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return null; // Password doesn't match
  }
  return user; // User found and password matches
}


export function getPost({
  id,
  user_id,
}: {
  id: number | null;
  user_id: number;
}): postInstance | null {
  const postGetter = db.prepare(
    "SELECT * FROM posts WHERE id = ? AND user_id = ?"
  );
  const post = postGetter.get(id, user_id) as postInstance;
  if (!post) {
    return null; // post is empty
  }
  return post;
}

export async function createUser(person: User): Promise<number> {
  console.log(chalk.greenBright("Creating user..."));

  // Ensure passwords match
  if (person.password !== person.re_password) {
    return 1; //password doesn't match
  }
  const name = person.name.toLocaleLowerCase();
  // Check if the user already exists
  const user = db.prepare("SELECT * FROM users WHERE name = ?").get(name) as | userInstance| undefined;
  if (user) {
    // User already exists
    return 2;
  }
  // Create a new user
  const hashedPassword = await bcrypt.hash(person.password, rounds);
  db.prepare("INSERT INTO users (name, password) VALUES (?, ?)").run(
    name,
    hashedPassword
  );

  return  3; // user created
}

export async function loginUser({ person }: { person: User }): Promise<number> {
  let name = person.name.toLocaleLowerCase();
  let password = person.password;

  // Search for the user in the database by name
  let search = db.prepare("SELECT * FROM users WHERE name = ?");
  let searchResult = search.get(name) as userInstance | undefined;

  if (!searchResult) {
    // User not found
    return 0; // "user doesn't exist"
  }
  // Compare provided password with the stored hashed password
  const passwordMatch = await bcrypt.compare(password, searchResult.password);
  if (!passwordMatch) {
    // Password doesn't match
    return 1; // "password doesn't match"
  }
  // User successfully logged in
  return 4; // "logged in"
}

export function createPost({
  user_id,
  title,
  post,
}: {
  user_id: number;
  title: string;
  post: string;
}): void {
  const createPost = db.prepare(
    "INSERt INTO posts (user_id, title, post) VALUES (?,?,?)"
  );
  createPost.run(user_id, title, post);
  console.log(chalk.green("post created"));
}

export function deletePost({
  user_id,
  id,
}: {
  user_id: number;
  id: number | null;
}): void {
  const removePost = db.prepare(
    "DELETE FROM posts where id = ? AND user_id = ?"
  );
  removePost.run(id, user_id);
  console.log(chalk.green("post deleted"));
}

export function viewPost({ post }: { post: postInstance }): void {
console.log(
  chalk.bgBlackBright(`
    ${chalk.blue("POST ID")}: ${post.id}\n
    ${chalk.blue("TITLE")}: ${chalk.bold(post.title)}\n
    ${chalk.blue("POST")}: ${post.post}\n
  `)
);
}

export function getAllPost({ id }: { id: number }): postInstance[] | null {
  const allPostStatements = db.prepare("SELECT id, title FROM posts where user_id = ?");
  const allPosts = allPostStatements.all(id) as postInstance[];
  if (!allPosts) {
    return null;
  }
  return allPosts;
}
