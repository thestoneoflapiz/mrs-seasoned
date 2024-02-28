import { getAuthUser, hashPassword } from "@/helpers/auth";
import { connectToDatabase } from "@/helpers/db";
import moment from "moment";

async function handler(req, res){
  if(req.method !== "POST"){
    return;
  }

  const data = JSON.parse(req.body);
  const { role, name, username } = data;
  if(!role || !name || !username || username.trim().length < 8){
    res.status(422).json({
      message: "Please fill in required fields..."
    });

    return;
  }

  const client = await connectToDatabase();
  const db = client.db();
  const authUser = await getAuthUser(req);

  const defaultPassword = `${username}${moment().format("YYYY")}$$`;
  const hashed = await hashPassword(defaultPassword);

  try {
    const users = await db.collection("users").insertOne({
      role, 
      name, 
      username,
      password: hashed, 
      created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      created_by: authUser?.name || (authUser?.name || "!!ERR")
    })

    client.close();
    res.status(201).json({
      message: "User created!"
    });
  } catch (error) {
    client.close();
    res.status(422).json({
      message: "Something went wrong...",
      error
    });
  }

  return;
}

export default handler;