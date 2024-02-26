import { getAuthUser } from "@/helpers/auth";
import { connectToDatabase } from "@/helpers/db";
import moment from "moment";

async function handler(req, res){
  if(req.method !== "POST"){
    return;
  }

  const data = JSON.parse(req.body);
  const { item_type, item, quantity, price, bought_date, bought_from, remarks } = data;
  if(!item_type || !item || !quantity || !price){
    res.status(422).json({
      message: "Please fill in required fields..."
    });

    return;
  }

  const client = await connectToDatabase();
  const db = client.db();
  const authUser = await getAuthUser(req);

  try {
    const expenses = await db.collection("expenses").insertOne({
      item_type,
      item,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      total: parseFloat(quantity)*parseFloat(price),
      bought_date: moment(bought_date).format(),
      bought_from,
      remarks,
      created_at: moment().format(),
      created_by: authUser?.name || (authUser?.name || "!!ERR")
    })

    client.close();
    res.status(201).json({
      message: "Item added!"
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