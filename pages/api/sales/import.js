import { getAuthUser } from "@/helpers/auth";
import { connectToDatabase } from "@/helpers/db";

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
  
  let sales = data.map((d)=>{
    return{
      item_type: d[0],
      item: d[1],
      quantity: parseFloat(d[2]),
      price: parseFloat(d[3]),
      total: parseFloat(d[2])*parseFloat(d[3]),
      bought_date: new Date(d[4]),
      bought_from: d[5],
      remarks: d[6],
      created_at: new Date(),
      created_by: authUser?.name || (authUser?.username || "!!ERR")
    }
  });

  sales = sales.filter((d)=>d.item_type!="");

  const client = await connectToDatabase();
  const db = client.db();

  try {
    const saleItems = await db.collection("sales").insertMany([
      ...sales
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