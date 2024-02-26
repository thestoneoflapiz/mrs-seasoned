import { getAuthUser } from "@/helpers/auth";
import { connectToDatabase } from "@/helpers/db";
import { BSON } from "mongodb";
import moment from "moment";

async function handler(req, res){
  if(req.method !== "POST"){
    return;
  }

  const data = JSON.parse(req.body);
  const { _id, item_type, item, quantity, price, bought_date, bought_from, remarks } = data;
  if(!_id && !item_type && !item && !quantity && !price){
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
    const expenses = await db.collection("expenses").updateOne({ _id: nid}, {
      $set: {
        item_type,
        item,
        quantity,
        price,
        total: parseFloat(quantity)*parseFloat(price),
        bought_date: moment(bought_date).format(),
        bought_from,
        remarks,
        updated_at: moment().format(),
        updated_by: authUser.username || "!!ERR"
      },
      $currentDate: { lastUpdated: true }
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