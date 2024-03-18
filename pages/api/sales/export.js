import { connectToDatabase } from "@/helpers/db";
import { ledMonthNum } from "@/helpers/strings";
import moment from "moment";
import { BSON } from "mongodb";

async function handler(req, res){
  if(req.method !== "GET"){
    return;
  }

  const { query } = req;
  const sortObj = {};
  sortObj[query?.by] = query?.sort=="asc"?1:-1;

  let completeQuery = {};

  if(query.year && query.month){
    const dateString = `${query.year}-${ledMonthNum(parseInt(query.month))}`;
    const mongoQuery = {
      "order_date": {
        "$regex": dateString,
      }
    };
    completeQuery = {...completeQuery, ...mongoQuery}
  }
  
  const client = await connectToDatabase();
  const db = client.db();

  if(query.search){
    let searchBy = "order_id";
    if(query.search_by){
      searchBy = query.search_by;
    }

    switch (searchBy) {
      case "customer":
        const fsCustomers = await db.collection("customers")
          .find({
            "$text": {
              "$search": query.search
            }
          }).project({
          "_id": 1,
        }).toArray();
        const customerIds = fsCustomers.map((c)=>{return c._id});
        completeQuery = {...completeQuery, "customer_id": { "$in": customerIds ?? [] }}
      break;
      case "order_id":
        completeQuery = {...completeQuery, "order_id": { "$eq": query.search }};
      break;
      case "mop":
        completeQuery = {...completeQuery, "mop": { "$eq": query.search }};
      break;
      case "address":
      case "remarks":
        const mongoSearch = {$text: {$search: query.search}};
        completeQuery = {...completeQuery, ...mongoSearch}
      break;
    
      default:
      break;
    }
  }

  completeQuery = {
    ...completeQuery, 
    "deleted_at": {
      "$exists": false,
    }
  }
  
  try {
    const sales = await db.collection("orders")
      .find(completeQuery)
      .sort(sortObj)
      .toArray();

    const menu =  await db.collection("menu").find({})
      .project({
        _id: 1,
        name: 1,
      })
      .toArray()

    const customers = await db.collection("customers")
      .find({"_id": { "$in": sales.map((s)=>s.customer_id)}})
      .project({
        id: 1,
        name: 1,
      })
      .toArray();

    client.close();
    res.status(201).json({
      sales,
      customers,
      menu
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