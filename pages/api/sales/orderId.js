import { connectToDatabase } from "@/helpers/db";
import { leadingZeroes } from "@/helpers/strings";

async function handler(req, res){
  if(req.method !== "GET"){
    return;
  }
  const client = await connectToDatabase();
  const db = client.db();
  const today = new Date();

  try {
    const ordersTotality = await db.collection("orders").countDocuments({
      "$expr": {
        "$and": [
          {"$eq": [{ "$year": "$sold_date" }, today.getFullYear()]},
        ],
      },
    });

    const ledByZeroOrder = leadingZeroes(ordersTotality+1);
    client.close();
    res.status(201).json({
      message: "Generated!",
      order_id: `${ledByZeroOrder}${today.getFullYear()}`
    });
  } catch (error) {
    res.status(422).json({
      message: "Unable to generate orderId...",
      error
    });
  }
}

export default handler;