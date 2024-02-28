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
      "created_at": {
        "$regex": dateString,
      }
    };
    completeQuery = {...completeQuery, ...mongoQuery}
  }
  
  if(query.search){
    const mongoSearch = {"name":{"$regex": query.search}};
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
    const totalExpenses = await db.collection("users").countDocuments(completeQuery);
    
    let pages = totalExpenses <= 10 ? 1 : totalExpenses / query.limit;
    pages = Math.ceil(pages);
    const users = await db.collection("users")
      .find(completeQuery)
      .skip((parseInt(query.page)-1)*parseInt(query.limit))
      .limit(parseInt(query.limit))
      .sort(sortObj)
      .toArray();

    client.close();
    res.status(201).json({
      list: users.map((item)=>{
        const dateFormatC = moment(item.created_at).format("YYYY-MM-DD");
        item.created = {
          by: item.created_by,
          date: dateFormatC
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