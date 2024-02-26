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
        const fsCustomer = await db.collection("customers").findOne({"name": { "$eq": query.search }});
        completeQuery = {...completeQuery, "customer_id": { "$eq": fsCustomer?._id || "" }}
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
  
  try {
    const totalSales = await db.collection("orders").countDocuments(completeQuery);
    
    let pages = totalSales <= 10 ? 1 : totalSales / query.limit;
    pages = Math.ceil(pages);

    const sales = await db.collection("orders")
      .find(completeQuery)
      .sort(sortObj)
      .skip((parseInt(query.page)-1)*parseInt(query.limit))
      .limit(parseInt(query.limit))
      .toArray();

    client.close();

    const customers = await db.collection("customers")
      .find({"_id": { "$in": sales.map((s)=>s.customer_id)}})
      .project({
        id: 1,
        name: 1,
      })
      .toArray();

    const list = await remapList(sales, customers);

    res.status(201).json({
      list,
      pagination: {
        total: totalSales,
        pages,
        page: parseInt(query.page),
        limit: parseInt(query.limit),
        sortObj
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

async function getCustomers(db, _id){
  const customer = await db.collection("customers")
    .findOne({_id})
  return customer;
}

async function remapList(sales, customers){
  let list = [];
  for (let i = 0; i < sales.length; i++) {
    const item = sales[i];
    const customer = customers.find((c)=>c._id.equals(item.customer_id));
    const dateFormatC = moment(item.created_at).format("YYYY-MM-DD hh:mm A");
    const dateFormatD = moment(item.order_date).format("YYYY-MM-DD hh:mm A");

    item.order_date = dateFormatD
    item.created = {
      by: item.created_by,
      date: dateFormatC
    }
    item.customer = customer?.name ?? "!!ERR";
    list.push(item);
  }

  return list;
}

export default handler;