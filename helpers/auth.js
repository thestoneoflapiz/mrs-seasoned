import { hash, compare } from "bcryptjs";

export async function hashPassword(password){
  const hashed = await hash(password, 12);
  return hashed;
}

export async function verifyPassword(password, hashedPassword){
  const isVerified = await compare(password, hashedPassword);
  return isVerified;
}