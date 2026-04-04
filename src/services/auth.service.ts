import prisma from "config/prisma"

const isEmailExist = async(email:string) => {
    const user = await prisma.user.findFirst({
        where: {
            email
        }
    })
    if(user) return true
    return false
}
const findUserByEmail = async(email:string) => {
  return await prisma.user.findUnique({
    where :{
      email
    }
  })
}

const findUserById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { userId: id },
  });

  if (!user) return null;

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword; 
};

const postUser = async (email: string, password: string, fullName: string) => {
  const user = await prisma.user.create({
    data: {
      email,
      password,
      fullName
    }
  });

  return user;
};

const postRefreshToken = async(userId: number, refreshToken:string, REFRESH_TOKEN_TTL: number) => {
  const ref = await prisma.session.create( {
    data: {
      userId,
      refreshToken,
      expiresAt:new Date(Date.now() + REFRESH_TOKEN_TTL)
    }
  })
}

const deleteSession = async(token:string) => {
  return await prisma.session.delete({
    where :{
      refreshToken:token
    }
  })
}
export {isEmailExist,postUser,findUserByEmail, postRefreshToken, deleteSession,findUserById}