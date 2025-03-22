import { connect } from '@/dbConfig/dbConfig';
import Artist from '@/models/Artists';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    await connect();

    try {
        const artistId = request.nextUrl.searchParams.get("artistId");
        

        if (!artistId) {
            return NextResponse.json({ status: 400, message: "Artist ID is missing", success: false });
        }

        // Find artist data
        const artistData = await Artist.findByIdAndDelete(artistId)
        if (!artistData) {
            return NextResponse.json({ status: 404, message: "Artist not found", success: false });
        }

        return NextResponse.json({
            message: "Artist found",
            success: true,
            status: 200,
            data: []
        });

    } catch (error: any) {
        console.log(error.message);
        return NextResponse.json({ status: 500, message: error.message, success: false });
    }
}
