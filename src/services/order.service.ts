import prisma from "config/prisma";

const createOrderService = async (userId:number, totalPrice:number) => {
    const order = await prisma.order.create({
      data: {
        userId, totalPrice,
        paymentStatus: "PENDING"
      }
    })
    return order
}
export {createOrderService}