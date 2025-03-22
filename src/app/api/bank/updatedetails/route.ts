import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import BankData from '@/models/Bank';

export async function POST(request: NextRequest) {
    try {
        await connect();

        const body = await request.json();
        console.log("data comming");
        console.log(body);
        

        const { labelId, accountDetails } = body;

        let bankDetails = await BankData.findOneAndUpdate(
            { labelId },
            { ...accountDetails }, // Update with the properties of accountDetails
            { new: true, runValidators: true }
        );

        console.log("update bak details :");
        console.log(bankDetails);
        
        

        if (bankDetails) {
            console.log("updated ---");
            
            return NextResponse.json({
                message: "Bank details updated",
                data: bankDetails,
                success: true,
                status: 201
            });
        } else {

            console.log("new ---");

            bankDetails = new BankData({
                labelId, ...accountDetails // Create new entry with account details spread into the document
            });
            const savedBankDetails = await bankDetails.save();

            console.log("new bank details :");
            console.log(savedBankDetails);
            

            return NextResponse.json({
                message: "Bank details added",
                data: savedBankDetails,
                success: true,
                status: 201
            });
        }
    } catch (error) {

        console.log("error  :");
        console.log(error);
        

        return NextResponse.json({
            message: "Internal server error",
            success: false,
            status: 500
        });
    }



}
