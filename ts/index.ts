import { initialChoices, actionChoice, info } from "./choice.js";
import { input, select, password, Separator, number } from "@inquirer/prompts";
import chalk from "chalk";
import {
  onExit,
  User,
  createUser,
  returnValues,
  loginUser,
  postInstance,
  createPost,
  userInstance,
  getUser,
  getPost,
  viewPost,
  getAllPost,
  deletePost,
} from "./utils.js";

let USER: userInstance| null = {
  id: 0,
  name: "",
  password: "",
};

async function main(): Promise<void> {
  console.log(chalk.redBright("WELCOME TO EFEMENA BLOG APP"));

  let firstChoice: string = "";

  for (let i = 0; i < 3; i++) {
    firstChoice = await select({
      message: "SIGNUP OR LOGIN",
      choices: initialChoices,
    });
    if (firstChoice) break;
    if (i === 2 && !firstChoice) process.exit(1);
  }

  const person: User = {
    name: await input({ message: "What is your name?" }),
    password: await password({ message: "Input your password" }),
    re_password:
      firstChoice === "signup"
        ? await password({ message: "Confirm your password" })
        : undefined,
  };

  if (firstChoice === "signup") {
    const createReturn = await createUser(person);
    if (createReturn !== 3) {
      console.error(returnValues[createReturn]);
      process.exit(1);
    }
  } else {
    const loginReturn = await loginUser({ person });
    if (loginReturn !== 4) {
      console.error(returnValues[loginReturn]);
      process.exit(1);
    }
  }

  try {
    USER = await getUser({ name: person.name, password: person.password });
    if (!USER || USER.id === 0) throw new Error("Failed to initialize USER.");
  } catch (err) {
    console.error(err as Error);
    process.exit(1);
  }

  while (true) {
    console.info(info)
    const action = await select({
      message: "What would you like to do?",
      choices: actionChoice,
    });

    if (action === "view") {
      const allPosts = getAllPost({ id: USER.id });
      if (!allPosts || allPosts.length === 0) {
        console.log("NO POST TO VIEW");
        continue;
      }

      console.table(allPosts);
      console.info(info)
      const postId = await number({ message: "Type in the post ID" });
      const postIdNum = Number(postId);
      if (isNaN(postIdNum)) {
        console.error("Invalid post ID");
        continue;
      }

      const post = getPost({ id: postIdNum, user_id: USER.id });
      if (post) {
        viewPost({ post });
      } else {
        console.log("No post found with that ID");
      }
    } else if (action === "create") {
      const post: postInstance = {
        title: await input({ message: "Type the title of your post:\n" }),
        post: await input({ message: "Type in your post:\n" }),
      };

      if (!post.title.trim() || !post.post.trim()) {
        console.error("Title and content cannot be empty.");
        continue;
      }

      createPost({ user_id: USER.id, title: post.title, post: post.post });
      console.log(chalk.green("POST CREATED"));
    } else if (action === "delete") {
      const allPosts = getAllPost({ id: USER.id })
      if (!allPosts || allPosts.length === 0) {
          console.log("NO POST TO VIEW");
          continue;
        }
      console.table(allPosts)
      const postId = await number({ message: "Type in the post ID" });
      const postIdNum = Number(postId);
      if (isNaN(postIdNum)) {
        console.error("Invalid post ID");
        continue;
      }

      deletePost({ user_id: USER.id, id: postIdNum });
      console.log(chalk.green("POST DELETED"));
    }
  }
}

try {
  await main();
} catch (e) {
  onExit(e as Error);
}


try{
    await main()
}catch(e){
    onExit(e as Error)
}