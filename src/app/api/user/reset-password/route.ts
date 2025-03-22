import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Label from '@/models/Label';
import bcryptjs from "bcryptjs"
import jwt  from 'jsonwebtoken';
export async function POST(request: NextRequest) {
    await connect();
  
    try {
      const { token, password } = await request.json();
  
      if (!token || !password) {
        return NextResponse.json({
          status: 400,
          success: false,
          error: "Invalid request"
        });
      }
  
      // Verify token
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET!);
      if (!decoded || typeof decoded === "string") {
        return NextResponse.json({
          status: 400,
          success: false,
          error: "Invalid token"
        });
      }
  
      const user = await Label.findById((decoded as any).id);
      if (!user) {
        return NextResponse.json({
          status: 400,
          success: false,
          error: "User not found"
        });
      }
  
      // Hash the new password
      const hashedPassword = await bcryptjs.hash(password, 10);
      user.password = hashedPassword;
      await user.save();
  
      return NextResponse.json({
        success: true,
        status: 200,
        message: "Password reset successfully"
      });
  
    } catch (error: any) {  // Explicitly type as 'any'
      console.log(error);
      return NextResponse.json({
        status: 500,
        success: false,
        error: error.message  // Access the 'message' property directly
      });
    }
  }
  