import { hashPassword, verifyPassword } from "@/helpers/auth";
import { getToken } from "next-auth/jwt";
import { connectToDatabase } from "@/helpers/db";
import moment from "moment";

async function handler(req, res){
  const data = JSON.parse(req.body);
  const { old, password } = data;
  if(req.method !== "POST"){
    // safest method is POST than PATCH, DELETE
    return;
  }

  const session = await getToken({req});
  if(!session){
    res.status(401).json({
      message: "Not authenticated..."
    });
    return;
  }

  const client = await connectToDatabase();
  const users = client.db().collection("users");

  const user = await users.findOne({username: session?.user?.username});
  if(!user){
    client.close();
    res.status(401).json({
      message: "Not authenticated..."
    });
    return;
  }

  const isVerified = await verifyPassword(old, user.password);
  if(!isVerified){
    client.close();
    res.status(422).json({
      message: "Password does not match..."
    });
    return;
  }

  const hashed = await hashPassword(password);
  try {
    
    const updated = await users.updateOne({ username: user.username }, {
      $set: {
        password: hashed,
        updated_at: moment().format(),
        updated_by: user.username
      },
      $currentDate: { lastUpdated: true }
    });

    client.close();
    res.status(200).json({
      message: "Password updated!"
    });
    return;
  } catch (error) {
    client.close();
    res.status(422).json({
      message: "Something went wrong...",
      error
    });
    return;
  }
}

export default handler;