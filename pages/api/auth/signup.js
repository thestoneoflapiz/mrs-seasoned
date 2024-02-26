import { hashPassword } from "@/helpers/auth";
import { connectToDatabase } from "@/helpers/db";
import moment from "moment";

async function handler(req, res){
  if(req.method !== "POST"){
    return;
  }
  const data = JSON.parse(req.body);
  const { username, password } = data;

  if(!username || username.trim().length < 8 || !password || password.length < 8){
    res.status(422).json({
      message: "Invalid: username or password is not valid..."
    });

    return;
  }

  const hashed = await hashPassword(password);

  const client = await connectToDatabase();
  const db = client.db();

  try {
    const found = findUser(username, db);
    if(found){
      const user = await db.collection("users").insertOne({
        username: username,
        name: username,
        password: hashed,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        created_by: "system",
      });
  
      if(!user){
        res.status(422).json({
          message: "Unable to create user..."
        });
      }
  
      res.status(200).json({
        message: "User created!"
      });
    }else{
      res.status(422).json({
        message: "User already exist...",
      });
    }
  } catch (error) {
    res.status(422).json({
      message: "Something went wrong...",
      error
    });
  }

  client.close();
  return;
}

async function findUser(username, db){
  const found = await db.collection("users").findOne({
    username: username
  }, {
    projection: {
      username: 1
    }
  });

  return !found;
}

export default handler;