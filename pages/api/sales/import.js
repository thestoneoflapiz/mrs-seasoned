import { getAuthUser } from "@/helpers/auth";
import { connectToDatabase } from "@/helpers/db";
import { difference, forEach, groupBy, has, sum } from "lodash";
import { BSON } from "mongodb";
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
  const fData = data.filter((d)=>d[0]!="");

  const client = await connectToDatabase();
  const db = client.db();
  const authUser = await getAuthUser(req);

  let dMenu = fData.map((d)=>{return d[3]});
  dMenu = [...new Set(dMenu)];

  let dCustomers = fData.map((d)=>{return d[2]});
  dCustomers = [...new Set(dCustomers)];

  const menu = await db.collection("menu").find({
    "name": { 
      "$in": dMenu
    }
  }).project({
    _id: 1,
    name: 1,
    price: 1,
  }).toArray();

  const customers = await getOrCreateCustomers(dCustomers, db, authUser);
  
  if(menu.length !== dMenu.length){
    client.close();
    res.status(422).json({
      message: "Menu missing, please update database...",
      missing: difference(dMenu, menu.map((m)=>m.name))
    });
    return;
  }

  const remapped = remapOrders(fData, authUser, menu, customers) ;  

  try {
    const sales = await db.collection("orders").insertMany([
      ...remapped
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

function remapOrders(data, authUser, menu, customers){
  const groupedOrders = groupBy(data, 11);
  const remapped = [];

  forEach(groupedOrders,function(orders, order_id){
    const fOrder = orders[0]
    const fCustomer = customers.find((c)=>c.name == fOrder[2]);
    const fDate = moment(`${fOrder[0]} ${fOrder[1]}`).format("YYYY-MM-DD HH:mm:ss");
    const fDiscount = fOrder[6] == "" ? 0 : parseFloat(fOrder[6]);
    const fFee = fOrder[9] == "" ? 0 : parseFloat(fOrder[9]);

    const fOrdersPrices = orders.map((o)=>{return o[4] * o[5]})
    const sumOrders = sum(fOrdersPrices)
    const fDiscounted = fDiscount ? (sumOrders * ((100-fDiscount)/100)) : sumOrders; 
    const fTotal = fDiscounted + fFee;

    remapped.push({
      order_id,
      order_date: fDate,
      customer_id: fCustomer?._id ?? "!!ERR",
      orders: orders.map((order)=>{
        const fMenu = menu.find((m)=>m.name == order[3]);
        return{
            menu_id: fMenu ? new BSON.ObjectId(fMenu._id) : "!!ERR",
            price: parseFloat(order[5]) ?? fMenu.price,
            quantity: parseInt(order[4]),
            total: parseFloat(order[7]),
        }
      }),
      discount: fDiscount,
      delivery_fee: fFee,
      delivery_address: fOrder[10],
      total: fTotal,
      mop: fOrder[8],
      remarks: fOrder[12],
      created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      created_by: authUser?.name || (authUser?.username || "!!ERR")
    })
  });

  return remapped;
}

async function getOrCreateCustomers(data, db, authUser){
  let noDCustomers = [];

  const findCustomers = await db.collection("customers")
    .find({"name": { "$in": data }})
    .project({
      _id: 1,
      name: 1
    })
    .toArray();

  if(findCustomers){
    const getNameCust = findCustomers.map((f)=>f.name);
    noDCustomers = difference(data, getNameCust);    
  }

  if(noDCustomers.length > 0){
    const remap = noDCustomers.map((c)=>{
      return {
        name: c,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        created_by: authUser?.name || (authUser?.username || "!!ERR")
      }
    });

    const createCustomer = await db.collection("customers")
      .insertMany([...remap]);
  }

  const fetchAllCustomers = await db.collection("customers")
  .find({"name": { "$in": data }})
  .project({
    _id: 1,
    name: 1
  })
  .toArray();
  
  return fetchAllCustomers ?? [];
}

export default handler;