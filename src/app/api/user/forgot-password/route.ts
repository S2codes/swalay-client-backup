import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConfig/dbConfig";
import Label from "@/models/Label";
import { Resend } from "resend";
import { PasswordResetTemplate } from "@/components/Email/PasswordReset";
import React from 'react';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  await connect();

  try {
    const { email } = await request.json();

    // Check if the email exists
    const user = await Label.findOne({ email });
    if (!user) {
      return NextResponse.json({
        status: 400,
        success: false,
        error: "User doesn't exist"
      });
    }

    // Generate a reset token
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET!, { expiresIn: "1h" });

    // Create the reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    // Generate the email content using the React component
    const emailContent = React.createElement(PasswordResetTemplate, { firstName: user.username, resetLink });

    // Send the email
    const { error } = await resend.emails.send({
      from: "SwaLay <swalay.care@talantoncore.in>",
      to: user.email,
      subject: "Password Reset Request",
      react: emailContent
    });

    if (error) {
      console.error("Email sending error:", error);
      return NextResponse.json({
        status: 500,
        success: false,
        error: "Failed to send password reset email"
      });
    }

    return NextResponse.json({
      success: true,
      status: 200,
      message: "Password reset email sent"
    });

  } catch (error:any) {
    console.log(error);
    return NextResponse.json({
      status: 500,
      success: false,
      error: error.message
    });
  }
}
