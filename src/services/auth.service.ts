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
export {isEmailExist,postUser}