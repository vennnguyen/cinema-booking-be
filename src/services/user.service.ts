import prisma from "@/config/prisma"

const getUser = async()=>{
    const user = await prisma.user.findMany()
    return user
}
export {getUser}