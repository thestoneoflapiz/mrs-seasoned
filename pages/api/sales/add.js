import { getAuthUser } from "@/helpers/auth";
import { connectToDatabase } from "@/helpers/db";

async function handler(req, res){
  if(req.method !== "POST"){
    return;
  }

  const data = JSON.parse(req.body);
  const { item_type, item, quantity, price, bought_date, bought_from, remarks } = data;
  if(!item_type && !item && !quantity && !price){
    res.status(422).json({
      message: "Please fill in required fields..."
    });

    return;
  }

  const client = await connectToDatabase();
  const db = client.db();
  const authUser = await getAuthUser(req);

  try {
    const sales = await db.collection("sales").insertOne({
      item_type,
      item,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      total: parseFloat(quantity)*parseFloat(price),
      bought_date: new Date(bought_date),
      bought_from,
      remarks,
      created_at: new Date(),
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