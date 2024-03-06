import { getAuthUser } from "@/helpers/auth";
import { connectToDatabase } from "@/helpers/db";
import { BSON } from "mongodb";
import moment from "moment";

async function handler(req, res){
  if(req.method !== "POST"){
    return;
  }

  const data = JSON.parse(req.body);
  const { _id, reason, amount } = data;
  if(!_id || !reason || !amount){
    res.status(422).json({
      message: "Please fill in required fields..."
    });

    return;
  }

  const client = await connectToDatabase();
  const db = client.db();
  const authUser = await getAuthUser(req);

  const nid = new BSON.ObjectId(_id);
  try {
    const cash_outs = await db.collection("cash_outs").updateOne({ _id: nid}, {
      $set: {
        reason,
        amount: parseFloat(amount),
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