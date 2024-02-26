import { getAuthUser } from "@/helpers/auth";
import { connectToDatabase } from "@/helpers/db";
import { BSON } from "mongodb";
import moment from "moment";

async function handler(req, res){
  if(req.method !== "POST"){
    return;
  }

  const data = JSON.parse(req.body);

  const { _id, order_date, order_id, customer, orders, 
    discount, mop, delivery_address, delivery_fee,
    total, remarks } = data;

  if(
    !_id || !order_date || !order_id || !customer 
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

  const nid = new BSON.ObjectId(_id);
  try {
    const cCustomer = await getOrCreateCustomer(customer, db, authUser);
    const cOrders = createOrders(orders);
    

    const sales = await db.collection("orders").updateOne({ _id: nid}, {
      $set: {
        order_date: moment(order_date).format(),
        customer_id: cCustomer._id ?? cCustomer.insertedId,
        "orders": cOrders,
        discount,
        mop,
        delivery_address,
        delivery_fee,
        total,
        remarks,
        updated_at: moment().format(),
        updated_by: authUser.username || "!!ERR"
      }
    })

    client.close();
    res.status(201).json({
      message: "Item updated!",
      sales
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
      menu_id: order.menu_id,
      price: order.price,
      quantity: order.quantity,
      total: order.price * order.quantity,
    }
  });

  return remapOrders;
}

export default handler;