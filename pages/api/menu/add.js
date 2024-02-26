import { getAuthUser } from "@/helpers/auth";
import { connectToDatabase } from "@/helpers/db";
import moment from "moment";

async function handler(req, res){
  if(req.method !== "POST"){
    return;
  }

  const data = JSON.parse(req.body);
  const { name, price } = data;
  if(!name || !price){
    res.status(422).json({
      message: "Please fill in required fields..."
    });

    return;
  }

  const client = await connectToDatabase();
  const db = client.db();
  const authUser = await getAuthUser(req);

  try {
    const menu = await db.collection("menu").insertOne({
      name,
      price: parseFloat(price),
      created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
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