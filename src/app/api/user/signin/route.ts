import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConfig/dbConfig";
import Label from "@/models/Label";
import bcryptjs from 'bcryptjs';
// import { EmailTemplate } from "@/components/Email/Welcome";
import { Resend } from 'resend';

//Resend
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: NextRequest) {
    console.log("herer");

    await connect();
    console.log("herer s");

    try {
        const reqBody = await request.json();
        
        console.log(reqBody);
        
        const { email, password } = reqBody;

        // Validate and format email address
        if (!email || !email.includes('@') || !email.includes('.')) {
            return NextResponse.json({
                status: 400,
                success: false,
                error: "Invalid email format"
            });
        }

        const user = await Label.findOne({ email });
        if (!user) {
            return NextResponse.json({
                status: 400,
                success: false,
                error: "User doesn't exist"
            });
        }

        const validPassword = await bcryptjs.compare(password, user.password);
        if (!validPassword) {
            return NextResponse.json({
                success: false,
                status: 400,
                error: "Check your credentials"
            });
        }

        const tokenData = {
            id: user._id,
            username: user.username
        };

        const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, { expiresIn: '5d' });

        // Send the welcome email to your own address for testing
        // eslint-disable-next-line no-unused-vars
        // const { data, error } = await resend.emails.send({
        //     from: 'SwaLay <onboarding@swalay.in>', // Correct format with a valid email address
        //     to: email, // Use the user's email address
        //     subject: 'Welcome to SwaLay!',
        //     react: EmailTemplate({ firstName: user.username }), // Assuming `username` as the first name
        // });
        

        // if (error) {
        //     console.error("Email sending error:", error);
        //     return NextResponse.json({
        //         status: 500,
        //         success: false,
        //         error: "Failed to send welcome email"
        //     });
        // }

        const response = NextResponse.json({
            message: "Logged In Success",
            data: user,
            success: true,
            status: 200
        });

        response.cookies.set("token", token, { httpOnly: true });

        return response;

    } catch (error: any) {
        console.log("error :: ");
        console.log(error);
        
        return NextResponse.json({
            error: error.message,
            success: false,
            status: 500
        });
    }
}
