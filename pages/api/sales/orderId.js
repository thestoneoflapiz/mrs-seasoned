import { connectToDatabase } from "@/helpers/db";
import { leadingZeroes } from "@/helpers/strings";
import moment from "moment";

async function handler(req, res){
  if(req.method !== "GET"){
    return;
  }
  const client = await connectToDatabase();
  const db = client.db();
  const year = moment().format("YYYY");
  const month = moment().format("M");

  try {
    const ordersTotality = await db.collection("orders").countDocuments( {
      "order_date": {
        "$regex": year,
      }
    });

    const ledByZeroOrder = leadingZeroes(ordersTotality+1);
    client.close();
    res.status(201).json({
      message: "Generated!",
      order_id: `${ledByZeroOrder}${month}${year}`
    });
  } catch (error) {
    res.status(422).json({
      message: "Unable to generate orderId...",
      error
    });
  }
}

export default handler;