import { connectToDatabase } from "@/helpers/db";

async function handler(req, res){
  if(req.method !== "GET"){
    return;
  }

  const { query } = req;

  if(query?.paginate==0){
    await list(req,res);
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
    const totalExpenses = await db.collection("menu").countDocuments(completeQuery);
    
    let pages = totalExpenses <= 10 ? 1 : totalExpenses / query.limit;
    pages = Math.ceil(pages);
    const menu = await db.collection("menu")
      .find(completeQuery)
      .skip(parseInt(query.page)-1)
      .limit(parseInt(query.limit))
      .sort(sortObj)
      .toArray();

    client.close();
    res.status(201).json({
      list: menu.map((item)=>{
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

async function list(req, res){
  const completeQuery = {
    "deleted_at": {
      "$exists": false,
    }
  }

  const client = await connectToDatabase();
  const db = client.db();
  
  try {
    const menu = await db.collection("menu")
      .find(completeQuery)
      .toArray();

    client.close();
    res.status(201).json({
      list: menu
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