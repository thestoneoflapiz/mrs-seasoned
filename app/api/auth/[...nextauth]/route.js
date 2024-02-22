import { verifyPassword } from "@/helpers/auth";
import { connectToDatabase } from "@/helpers/db";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions = {
  pages: {
    signIn: "/"
  },
  session: {
    jwt: true
  },
  callbacks: {
    async session({ session, token }) {
      session.user = token.user;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials, req){
        const client = await connectToDatabase();

        const users = client.db().collection("users");

        const user = await users.findOne({username: credentials?.username});
        if(!user){
          client.close();
          throw new Error("User does not exist...");
        }

        const isVerified = await verifyPassword(credentials?.password || "", user.password);
        if(!isVerified){
          client.close();
          throw new Error("Incorrect password...");
        }

        client.close();
        return {
          ...user, password: ""
        };
      }
    })
  ]
}

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };