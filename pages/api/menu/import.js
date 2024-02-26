import { getAuthUser } from "@/helpers/auth";
import { connectToDatabase } from "@/helpers/db";
import moment from "moment";

async function handler(req, res){
  if(req.method !== "POST"){
    return;
  }

  const { data } = JSON.parse(req.body);
  if(data.length==0){
    res.status(422).json({
      message: "Empty file..."
    });

    return;
  }

  const authUser = await getAuthUser(req);
  
  let menu = data.map((d)=>{
    return{
      name: d[0],
      price: parseFloat(d[1]),
      created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      created_by: authUser?.name || (authUser?.username || "!!ERR")
    }
  });

  menu = menu.filter((d)=>d.name!="");

  const client = await connectToDatabase();
  const db = client.db();

  try {
    const expenseItems = await db.collection("menu").insertMany([
      ...menu
    ]);

    client.close();
    res.status(201).json({
      message: "Import success!"
    });
  } catch (error) {
    client.close();
    res.status(422).json({
      message: "Something went wrong...",
      error
    });
  }

}

export default handler;