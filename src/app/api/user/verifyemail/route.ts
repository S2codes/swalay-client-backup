import { connect } from "@/dbConfig/dbConfig";
import Label from "@/models/Label";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    await connect();
    console.log("verify email start ...");
    
    try {
        const reqBody = await request.json();
        console.log("reqBody : ");
        console.log(reqBody);

        const token = reqBody.token;  // Assuming `reqBody` contains a `token` field
        console.log("token ::");
        console.log(token);
        console.log("-----");

        const user = await Label.findOne({
            verifyCode: token,
            verifyCodeExpiry: { $gt: Date.now() }
        });

        if (!user) {
            console.log("user not found");
            return NextResponse.json({
                status: 400,
                message: "Invalid token",
                success: false
            });
        }

        user.isVerified = true;
        user.verifyCode = "";
        user.verifyCodeExpiry = null;

        await user.save();

        return NextResponse.json({
            status: 200,
            message: "Email verified successfully",
            success: true
        });

    } catch (error) {
        console.error("Error during email verification:", error);
        return NextResponse.json({
            status: 500,
            message: "Internal server error",
            success: false
        });
    }
}
