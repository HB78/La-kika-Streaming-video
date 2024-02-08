import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

const prisma = new PrismaClient();

function validateEmail(email) {
  var re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function validateName(name) {
  let regex = new RegExp("[a-zA-Z]");
  return regex.test(name);
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    //on choisit les infos qu'il y aura sur l'accréditation
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        //si le user n'a pas entré d'email ou de mot de passe
        if (!credentials.email || !credentials.password) return null;

        //si le user n'entre pas d'email valide
        if (!validateEmail(credentials.email)) return null;

        //si le user n'entre pas de mot de passe valide
        if (credentials.password.length < 4 || credentials.password.length > 80)
          return null;

        //si le user n'entre pas de nom valide
        if (!validateName(credentials.name)) return null;

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });
        //si le user n'existe pas
        if (!user) {
          return null;
        }

        //si le mot de passe n'est pas correct
        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          return {
            id: user.id,
            name: user.name,
            isAdmin: user.isAdmin,
            email: user.email,
            picture: user.image,
          };
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, session, trigger }) {
      // console.log("jwt", user, session, token);

      if (trigger === "upddate" && session?.name) {
        token.name = session.name;
      }

      if (user) {
        return {
          ...token,
          id: user.id,
          name: user.name,
          isAdmin: user.isAdmin,
          email: user.email,
          picture: user.image,
        };
      }
      //update user
      const newUser = await prisma.user.update({
        where: {
          id: token.id,
        },
        data: {
          name: token.name,
        },
      });

      return token;
    },
    async session({ session, token, user }) {
      // console.log("---> session", ...session);
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          name: token.name,
          isAdmin: token.isAdmin,
          email: token.email,
        },
      };
    },
  },

  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  // debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
