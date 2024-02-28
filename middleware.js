import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server'
import { adminAccess, staffAccess } from './helpers/constants';
import { join, slice } from 'lodash';
 
export async function middleware(req) {
  const session = await getToken({ req });

  const rawPathname = req.nextUrl?.pathname;
  const splitPathname = rawPathname.split("/");
    let pathname = "";
  if( splitPathname.length > 3 ){
    const removedPathname = slice(splitPathname,0,3);
    pathname = join(removedPathname, "/");
  }else{
    pathname = join(splitPathname, "/");
  }

  if(session && session.user?._id){
    const user = session.user;

    switch (user.role) {
      case "admin":
        if(adminAccess.includes(pathname)){
          return;
        }else{
          return NextResponse.json({ message: 'ADMIN have no access here' }, { status: 404 })
        }
      break;

      case "staff":
        if(staffAccess.includes(pathname)){
          return;
        }else{
          return NextResponse.json({ message: 'STAFF have no access here' }, { status: 404 })
        }
      break;
    }

    return;
  } 
  
  return NextResponse.redirect(new URL('/', req.url))
}
 
export const config = {
  matcher: ['/admin', '/admin/:path*'],
}