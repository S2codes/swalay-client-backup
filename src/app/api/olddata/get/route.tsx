import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import oldData from "@/models/oldData";

export async function GET(req: NextRequest) {
  try {
    await connect();
    const labelName = req.nextUrl.searchParams.get("labelName");

    if (!labelName) {
      return NextResponse.json({
        message: "Label name is required",
        success: false,
        status: 400,
      });
    }

    const data = await oldData.find({ Label: labelName });

    return NextResponse.json({
      message: "Data fetched successfully",
      success: true,
      status: 200,
      data,
    });

  } catch (error: any) {
    console.error("Error fetching data:", error);
    return NextResponse.json({
      message: "Internal server error",
      success: false,
      status: 500,
    });
  }
}
