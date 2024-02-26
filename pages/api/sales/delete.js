import { getAuthUser } from "@/helpers/auth";
import { connectToDatabase } from "@/helpers/db";
import { BSON } from "mongodb";
import moment from "moment";

async function handler(req, res){
  if(req.method !== "POST"){
    return;
  }

  const data = JSON.parse(req.body);
  const { _id } = data;
  if(!_id){
    res.status(422).json({
      message: "Unable to retrieve data..."
    });

    return;
  }

  const client = await connectToDatabase();
  const db = client.db();
  const authUser = await getAuthUser(req);

  const nid = new BSON.ObjectId(_id);
  try {
    const sales = await db.collection("sales").updateOne({ _id: nid}, {
      $set: {
        deleted_at: moment().format(),
        deleted_by: authUser.username || "!!ERR"
      }
    })

    client.close();
    res.status(201).json({
      message: "Item deleted!"
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