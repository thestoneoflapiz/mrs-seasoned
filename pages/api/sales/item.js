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
    const saleItem = await db.collection("orders").findOne({_id: nid, deleted_at: { "$exists": false}});
    const menuIds = saleItem.orders.map((o)=>{return new BSON.ObjectId(o.menu_id)});
    const menuList = await db.collection("menu")
      .find({"_id": { "$in": menuIds}})
      .project({
        _id: 1,
        name: 1,
        price: 1
      })
      .toArray();

    if(!saleItem){
      client.close();
      res.status(404).json({
        message: "Item not found...",
        ...query
      });
      return;
    }

    const customer = await db.collection("customers").findOne({"_id": saleItem.customer_id});

    saleItem.customer = customer?.name || "!!ERR";
    saleItem.orders = saleItem.orders.map((o)=>{
      o.menu = menuList.find((m)=>m._id==o.menu_id)?.name || "!!EERR";
      return o;
    })
    
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