import { getAuthUser, hashPassword } from "@/helpers/auth";
import { connectToDatabase } from "@/helpers/db";
import { BSON } from "mongodb";
import moment from "moment";

async function handler(req, res){
  if(req.method !== "POST"){
    return;
  }

  const data = JSON.parse(req.body);
  const { _id } = data;
  if(!_id || !role || !name || !username){
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
  
  const nid = new BSON.ObjectId(_id);
  try {
    const users = await db.collection("users").updateOne({ _id: nid}, {
      $set: {
        password: hashed,
        updated_at: moment().format(),
        updated_by: authUser.username || "!!ERR"
      }
    })

    client.close();
    res.status(201).json({
      message: "Item updated!"
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