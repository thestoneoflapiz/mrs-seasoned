import { connectToDatabase } from "@/helpers/db";
import { BSON } from "mongodb";

async function handler(req, res){
  if(req.method !== "GET"){
    return;
  }

  const { query } = req;
  
  const client = await connectToDatabase();
  const db = client.db();
  
  try {
    const nid = new BSON.ObjectId(query._id)
    const saleItem = await db.collection("sales").findOne({_id: nid, deleted_at: { "$exists": false}});

    if(!saleItem){
      client.close();
      res.status(404).json({
        message: "Item not found...",
        ...query
      });
      return;
    }

    client.close();
    res.status(201).json({
      message: "Data retrieved!",
      item: saleItem,
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