import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import React from 'react';
import Label from "@/models/Label";
import bcryptjs from 'bcryptjs';
import fetch from 'node-fetch';
import sendMail from "@/helpers/sendMail";
import RegisterEmailTemplate from "@/components/Email/RegisterEmailTemplate";

interface RazorpayResponse {
    id: string;
    name: string;
    email: string;
    contact: Number;
}

export async function POST(request: NextRequest) {

    await connect();

    try {
        const reqBody = await request.json();
        const { username, email, password, contact, state, reference_id, notes } = reqBody;

        if (!username || !email || !contact) {
            console.log("Validation Failed: Missing required fields");
            return NextResponse.json({
                message: "Username, email, and contact are required fields",
                success: false,
                status: 400
            });
        }


        const razorpayApiKey = process.env.RAZORPAY_KEY_ID;
        const razorpayApiSecret = process.env.RAZORPAY_KEY_SECRET;

        const razorpayResponse = await fetch('https://api.razorpay.com/v1/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${razorpayApiKey}:${razorpayApiSecret}`).toString('base64')}`,
            },
            body: JSON.stringify({
                name: username,
                email: email,
                contact: contact,
                type: 'vendor',
                reference_id: reference_id || '',
                notes: notes || {},
            }),
        });

        const razorpayData = await razorpayResponse.json() as RazorpayResponse;


        if (!razorpayResponse.ok) {
            console.error("Failed to create Razorpay contact:", razorpayData);
            return NextResponse.json({
                message: "Failed to create Royalty account. Please Contact Support",
                razorpayError: razorpayData,
                success: false,
                status: razorpayResponse.status
            });
        }

        const razorpayContactId = razorpayData.id;

        const hashedPassword = await bcryptjs.hash(password, 10);

        const newUser = new Label({
            username,
            email,
            contact, 
            state,
            razor_contact: razorpayContactId, // Ensure this matches the schema
            password: hashedPassword,
            lable: "SwaLay Digital"
        });
           
         await newUser.save();

        const emailTemplate = React.createElement(RegisterEmailTemplate, { clientName: username });
 
         await sendMail({
            to: email, // Key 'to' must be specified
            subject: "Welcome to SwaLay Plus - Account Created Successfully", // Key 'subject' must be specified
            emailTemplate, // This passes the rendered template
        });

        return NextResponse.json({
            message: "Account created successfully",
            userData: reqBody,
            success: true,
            status: 200
        });

    } catch (error: any) {
        console.error("Error in API:", error.message);
        return NextResponse.json({
            error: error.message,
            success: false,
            status: 500
        });
    }
}
