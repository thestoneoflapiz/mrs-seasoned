import { connectToDatabase } from "@/helpers/db";
import { ledMonthNum } from "@/helpers/strings";
import { forEach, groupBy, sortBy, sum, values } from "lodash";
import moment from "moment";

async function handler(req, res){
  if(req.method !== "GET"){
    return;
  }

  const { query } = req;
  if(!query.report || !query.filter || !query.year
    ){
    res.status(422).json({
      message: "Unable to generate report..."
    });
    return
  }

  let completeQuery = {};

  if(query.filter=="year"){
    const dateString = `${query.year}`;
    const mongoQuery = {
      "order_date": {
        "$regex": dateString,
      }
    };
    completeQuery = {...completeQuery, ...mongoQuery}
  }

  if(query.filter=="month" && query.month && query.year){
    const dateString = `${query.year}-${ledMonthNum(parseInt(query.month))}`;
    const mongoQuery = {
      "order_date": {
        "$regex": dateString,
      }
    };
    completeQuery = {...completeQuery, ...mongoQuery}
  }

  completeQuery = {
    ...completeQuery, 
    "deleted_at": {
      "$exists": false,
    }
  }

  const client = await connectToDatabase();
  const db = client.db();
  
  let data = [];
  try {

    switch (query.report) {
      case "total":
        data = await queryTotal(completeQuery, db, query.filter);
      break;

      case "totality":
        data = await queryTotality(completeQuery, db, query.filter);
      break;
    
      default:
        data = await queryDefault(completeQuery, db, query.filter);
      break;
    }

    client.close();
    res.status(201).json({
      data
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

async function queryDefault(query, db, filter){
  const data = await db.collection("orders")
  .find(query)
  .project({
    order_id: 1,
    order_date: 1,
    discount: 1,
    total: 1,
    delivery_address: 1,
    delivery_fee: 1,
  })
  .toArray();

  return data || [];
}

async function queryTotal(query, db, filter){
  const dateFormat = filter=="month"? "DD" : "MM-DD";
  const data = await db.collection("orders")
  .find(query)
  .project({
    order_date: 1,
    total: 1,
  })
  .toArray();
  
  const remap = data.map((d)=>{
    d.order_date = moment(d.order_date).format("YYYY-MM-DD");
    return d;
  })

  
  if(data.length){
    const grouped = groupBy(remap, "order_date")
    let sorted = [];
    forEach(grouped, function(byDate){
      const firstRecord = byDate[0];
      const totality = byDate.map((e)=>{return e.total})
      sorted.push({
        name: moment(firstRecord.order_date).format(dateFormat),
        total: sum(totality)
      });
    });
    
    return sortBy(sorted, ["name"]);
  }
  return [];
}

async function queryTotality(query, db, filter){
  const remapped = [];
  const data = await db.collection("orders")
    .find(query)
    .project({
      order_id:1,
      total: 1,
      orders: 1,
      discount: 1,
      delivery_fee: 1,
      delivery_address: 1,
      customer_id: 1,
    })
    .toArray();

  // sales, tubo, dfee, discounts, customers, places
  
  if(data && data.length > 0){
    const totalSales = data.map((s)=>{ return s.total-s.delivery_fee });
    const sumSales = sum(totalSales);
    remapped.push({
      name: "Sales",
      desc: `total of ${totalSales.length} orders`,
      amount: sumSales,
    });

    const totalDiscounts = data.filter((s)=>s.discount>0);
    const totalNoDiscounts = data.filter((s)=>s.discount==0);
    const sumNoDiscounts = sum(totalNoDiscounts.map((d)=>{ return d.total-d.delivery_fee }));  
    const sumDiscountsReverted = sum(totalDiscounts.map((d)=>{
      const discount = (100-d.discount)/100;
      const totalMinusFee = d.total-d.delivery_fee;
      const unDiscount = totalMinusFee / discount;
      return unDiscount;
    }));

    const totalExpectedSales = sumNoDiscounts+sumDiscountsReverted;
    const totalAmountOfDiscounted = totalExpectedSales-sumSales;

    remapped.push({
      name: "Tubo",
      desc: `30% off sales`,
      amount: (totalExpectedSales*0.3)-totalAmountOfDiscounted,
    });

    remapped.push({
      name: "Discount",
      desc: `total of ${totalDiscounts.length} discounted`,
      amount: totalAmountOfDiscounted,
    });

    const groupedByCustomers = groupBy(data, "customer_id")
    const totalCustomers = values(groupedByCustomers);
    
    remapped.push({
      name: "Customers",
      desc: `total of`,
      amount: totalCustomers.length || 0,
    });

    const groupedByPlaces = groupBy(data, "delivery_address")
    const totalPlaces = values(groupedByPlaces);
    
    remapped.push({
      name: "Places",
      desc: `total of`,
      amount: totalPlaces.length || 0,
    });

    return remapped;
  }

  return [];
}

export default handler;