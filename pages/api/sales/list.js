import { connectToDatabase } from "@/helpers/db";
import { BSON } from "mongodb";

async function handler(req, res){
  if(req.method !== "GET"){
    return;
  }

  const { query } = req;
  const sortObj = {};
  sortObj[query?.by] = query?.sort=="asc"?1:-1;
 
  //  month year search and sort field and by
  const mongoQuery = {
    "$expr": {
      "$and": [
        {"$eq": [{ "$year": "$order_date" }, parseInt(query.year)]},
        {"$eq": [{ "$month": "$order_date" }, parseInt(query.month)]}
      ],
    },
  };

  const mongoSearch = {$text: {$search: query.search}};

  let completeQuery = {};

  if(query.year && query.month){
    completeQuery = {...completeQuery, ...mongoQuery}
  }
  
  if(query.search){
    completeQuery = {...completeQuery, ...mongoSearch}
  }

  if(query?.ne_id){
    const nid = new BSON.ObjectId(query.ne_id)
    completeQuery = {...completeQuery, "_id": {"$ne": nid}}
  }

  completeQuery = {
    ...completeQuery, 
    "deleted_at": {
      "$exists": false,
    }
  }

  const client = await connectToDatabase();
  const db = client.db();
  
  try {
    const totalExpenses = await db.collection("orders").countDocuments(completeQuery);
    
    let pages = totalExpenses <= 10 ? 1 : totalExpenses / query.limit;
    pages = Math.ceil(pages);
    const sales = await db.collection("orders")
      .find(completeQuery)
      .skip(parseInt(query.page)-1)
      .limit(parseInt(query.limit))
      .sort(sortObj)
      .toArray();

    client.close();

    const list = await remapList(sales, db);

    res.status(201).json({
      list,
      pagination: {
        total: totalExpenses,
        pages,
        page: parseInt(query.page),
        limit: parseInt(query.limit),
      }
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

async function getCustomer(db, _id){
  const customer = await db.collection("customers")
    .findOne({_id})
  return customer;
}

async function remapList(sales, db){
  let list = [];

  for (let i = 0; i < sales.length; i++) {
    const item = sales[i];
    const dateFormatC = new Date(item.created_at);
    const dateFormatD = new Date(item.order_date);
    item.order_date = `${dateFormatD.getFullYear()}-${dateFormatD.getMonth()+1}-${dateFormatD.getDate()}`
    item.created = {
      by: item.created_by,
      date: `${dateFormatC.getFullYear()}-${dateFormatC.getMonth()+1}-${dateFormatC.getDate()}`
    }
    const customer = await getCustomer(db, item.customer_id);
    item.customer = customer?.name ?? "!!ERR";
    list.push(item);
  }

  return list;
}

export default handler;