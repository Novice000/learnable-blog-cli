export type Message = {
 message: string
};

type Choice<Value> = {
  value: Value;
  name?: string;
  description?: string;
  short?: string;
  disabled?: boolean | string;
};

export const info: string = "Press Ctrl+C to exit at any time except during databse operations";

export const initialChoices: Choice<string>[] = [
  {
    value : "signup",
    name: "SIGNUP",
    description: "to create new user"
  },
  {
    value : "signin",
    name: "SIGNIN",
    description: "to login as a new user"
  },
]; 


export const actionChoice: Choice<string>[] = [
  {
    value: "view",
    name: "VIEW",
    description: "view a particular post by post id"
  },
  {
    value: "create",
    name: "CREATE",
    description: "view a particular post by post id"
  },
  {
    value: "delete",
    name: "DELETE",
    description: "view a particular post by post id"
  }
]

