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
        {"$eq": [{ "$year": "$bought_date" }, parseInt(query.year)]},
        {"$eq": [{ "$month": "$bought_date" }, parseInt(query.month)]}
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
  console.log("completeQuery::: ", completeQuery);
  const client = await connectToDatabase();
  const db = client.db();
  
  try {
    const totalExpenses = await db.collection("expenses").countDocuments(completeQuery);
    
    let pages = totalExpenses <= 10 ? 1 : totalExpenses / query.limit;
    pages = Math.ceil(pages);
    const expenses = await db.collection("expenses")
      .find(completeQuery)
      .skip(parseInt(query.page)-1)
      .limit(parseInt(query.limit))
      .sort(sortObj)
      .toArray();

    client.close();
    res.status(201).json({
      list: expenses.map((item)=>{
        const dateFormatC = new Date(item.created_at);
        const dateFormatD = new Date(item.bought_date);
        item.bought_date = `${dateFormatD.getFullYear()}-${dateFormatD.getMonth()+1}-${dateFormatD.getDate()}`
        item.created = {
          by: item.created_by,
          date: `${dateFormatC.getFullYear()}-${dateFormatC.getMonth()+1}-${dateFormatC.getDate()}`
        }
        return item;
      }),
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

export default handler;