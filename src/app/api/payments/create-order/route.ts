import { NextRequest, NextResponse } from "next/server";
import Razorpay from 'razorpay';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting create-order process');
    
    console.log('Razorpay Credentials Check:', {
      keyIdExists: !!process.env.RAZORPAY_KEY_ID,
      keySecretExists: !!process.env.RAZORPAY_KEY_SECRET,
      keyIdValue: process.env.RAZORPAY_KEY_ID?.substring(0, 4) + '...',
    });

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials are missing');
    }

    console.log('Creating Razorpay instance...');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('Razorpay instance created');

    const options = {
      amount: 82482,  // amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    console.log('Attempting to create order with options:', options);

    try {
      const order = await razorpay.orders.create(options);
      console.log('Order created successfully:', order);
      
      return NextResponse.json({
        success: true,
        orderId: order.id,
      });
    } catch (razorpayError: any) {
      console.error('Razorpay API Error Details:', {
        name: razorpayError.name,
        message: razorpayError.message,
        description: razorpayError.description,
        statusCode: razorpayError.statusCode,
        error: razorpayError
      });
      throw razorpayError; // Throw the original error to preserve stack trace
    }
  } catch (error: any) {
    console.error('Final error catch block:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json({
      success: false,
      message: error.message || "Failed to create order",
      error: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    }, { status: 500 });
  }
} 