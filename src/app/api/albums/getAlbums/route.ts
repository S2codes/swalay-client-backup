import { NextRequest, NextResponse } from 'next/server';
import Album from '@/models/albums';
import { connect } from '@/dbConfig/dbConfig';
import mongoose from 'mongoose'; // Import mongoose to use ObjectId

export async function GET(req: NextRequest) {

    await connect();

    const labelId = req.nextUrl.searchParams.get("labelId");

    if (!labelId || !mongoose.Types.ObjectId.isValid(labelId)) {
        return NextResponse.json({
            message: "Invalid or missing labelId",
            success: false,
            status: 400,
        });
    }

    console.log("labelId: ", labelId);

    try {
        // Convert the labelId string to a mongoose ObjectId
        const albums = await Album.find({ labelId: new mongoose.Types.ObjectId(labelId) });

        if (albums.length === 0) {
            return NextResponse.json({
                message: "No albums found for the given labelId",
                success: false,
                status: 404,
            });
        }

        return NextResponse.json({
            message: "Albums found",
            success: true,
            status: 200,
            data: albums,
        });
    } catch (error) {
        console.error('Internal Server Error:', error);

        return NextResponse.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
}
