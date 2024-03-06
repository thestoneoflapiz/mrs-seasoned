import { connectToDatabase } from "@/helpers/db";
import moment from "moment";

async function handler(req, res){
  if(req.method !== "GET"){
    return;
  }

  await paginatedList(req,res);
}

async function paginatedList(req, res){
  const { query } = req;

  const sortObj = {};
  sortObj[query?.by] = query?.sort=="asc"?1:-1;
 
  //  month year search and sort field and by
  const mongoSearch = {$text: {$search: query.search}};

  let completeQuery = {};

  if(query.search){
    completeQuery = {...completeQuery, ...mongoSearch}
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
    const totalExpenses = await db.collection("cash_outs").countDocuments(completeQuery);
    
    let pages = totalExpenses <= 10 ? 1 : totalExpenses / query.limit;
    pages = Math.ceil(pages);
    const cash_outs = await db.collection("cash_outs")
      .find(completeQuery)
      .skip((parseInt(query.page)-1)*parseInt(query.limit))
      .limit(parseInt(query.limit))
      .sort(sortObj)
      .toArray();

    client.close();
    res.status(201).json({
      list: cash_outs.map((item)=>{
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