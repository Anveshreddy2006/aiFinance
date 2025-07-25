"use server"
import { auth } from "@clerk/nextjs/dist/types/server"
import { db } from "@/lib/prisma";
export async function createAccount(data){
    try{
        const userId = await auth();
        if(!userId) throw new Error("Unauthorized");

       const user = await db.user.findUnique({
        where:{clerkUserId:userId}
       }) ;

         if(!user){
           throw new Error("user not found");
         }


         //convert balance into float before saving
         const balanceFloat = parseFloat(data.balance)
         if(isNaN(balanceFloat)){
           throw new Error("invalid balance amout")
         } 

         //check if this is the user's first account
         const existingAccount = await db.account.findMany({
              where:{userId : user.id},

         });


         const shouldBeDefault = existingAccount.length ==0 ? true: data.isDefault;

         //if this account should be default, unset other default account 
          
      if(shouldBeDefault){
        await db.account.updateMany({
            where : {userId : user.id ,isDefault:true},
            data : {isDefault:false},
        })
      }


    
    const account = await db.account.create({
        data: {
            ...data,
            balance: balanceFloat,
            userId: user.id,
            isDefault :shouldBeDefault,

        }
    });

    }catch(error){

    }
}