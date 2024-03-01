import { getAuthUser } from "@/helpers/auth";
import { connectToDatabase } from "@/helpers/db";
import moment from "moment";
import { BSON } from "mongodb";

async function handler(req, res){
  if(req.method !== "POST"){
    return;
  }

  const data = JSON.parse(req.body);

  const { order_date, order_id, customer, orders, 
    discount, mop, delivery_address, delivery_fee,
    total, remarks } = data;

  if(
    !order_date || !order_id || !customer 
    || (!orders || orders.length == 0) || !delivery_address 
    || !total
  ){
    res.status(422).json({
      message: "Please fill in required fields..."
    });
    return;
  }

  const client = await connectToDatabase();
  const db = client.db();
  const authUser = await getAuthUser(req);

  try {
    const cCustomer = await getOrCreateCustomer(customer, db, authUser);
    const cOrders = createOrders(orders);
    const sales = await db.collection("orders").insertOne({
      order_date: moment(order_date).format(),
      order_id,
      customer_id: cCustomer._id ?? cCustomer.insertedId,
      "orders": cOrders,
      discount,
      mop,
      delivery_address,
      delivery_fee,
      total,
      remarks,
      created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      created_by: authUser?.name || (authUser?.name || "!!ERR")
    })

    client.close();
    res.status(201).json({
      message: "Sale added!",
      order: {
        ...sales,
        items: cOrders
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

async function getOrCreateCustomer(name,db,authUser){
  const findCustomer = await db.collection("customers")
    .findOne({"name": name});

  if(!findCustomer){
    const customer = await db.collection("customers")
      .insertOne({
        name,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        created_by: authUser?.name || (authUser?.name || "!!ERR")
      })

      console.log(customer);
    return customer;
  }

  return findCustomer;

}

function createOrders(orders){
  const remapOrders = orders.map((order)=>{
    return {
      menu_id: new BSON.ObjectId(order.menu_id),
      price: order.price,
      quantity: order.quantity,
      total: order.price * order.quantity,
    }
  });

  return remapOrders;
}

export default handler;