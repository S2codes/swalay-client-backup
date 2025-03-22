import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Notification from "@/models/notification";

export async function GET(req: NextRequest) {
  try {
    await connect();
    const labelId = req.nextUrl.searchParams.get("labelId");

    let notifications;

    if (labelId) {
      // Fetch notifications where the labelId is in the labels array
      notifications = await Notification.find({
        $or: [
          { labels: labelId },    // Match notifications with the specific label
          { toAll: { $in: [true, null] } }  // Match notifications sent to all
        ]
      }).select('-labels');
      

    } else {
      // Fetch all notifications if no labelId is provided
      notifications = await Notification.find();
    }

    

    return NextResponse.json({
      message: "Notifications fetched successfully",
      success: true,
      status: 200,
      data: notifications,
    });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({
      message: "Internal server error",
      success: false,
      status: 500,
    });
  }
}
