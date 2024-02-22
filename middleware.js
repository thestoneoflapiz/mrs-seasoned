import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server'
 
export async function middleware(req) {
  const session = await getToken({ req });
  console.log("sess: ", session);
  if(session && session.user?._id){
    return;
  }
  return NextResponse.redirect(new URL('/', req.url))
}
 
export const config = {
  matcher: ['/admin', '/admin/:path*'],
}