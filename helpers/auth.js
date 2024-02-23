import { hash, compare } from "bcryptjs";
import { getToken } from "next-auth/jwt";

export async function hashPassword(password){
  const hashed = await hash(password, 12);
  return hashed;
}

export async function verifyPassword(password, hashedPassword){
  const isVerified = await compare(password, hashedPassword);
  return isVerified;
}

export async function getAuthUser(req){
  const session = await getToken({req});
  return session?.user || null;
}