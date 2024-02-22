import { getToken } from "next-auth/jwt";

async function handler(req, res){

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

  // put your logic here
}

export default handler;