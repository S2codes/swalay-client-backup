import { connect } from '@/dbConfig/dbConfig';
import Youtube from '@/models/youtube';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    await connect();

    try {

        const labelId = request.nextUrl.searchParams.get("labelid");


        if (!labelId) {
            return NextResponse.json({ status: 400, message: "label ID is missing", success: false });
        }

        const copyrightsData = await Youtube.find({ labelId: labelId }).sort({_id: -1});
        
        return NextResponse.json({
            message: "Artist found",
            success: true,
            status: 200,
            data: copyrightsData
        });

    } catch (error: any) {
        return NextResponse.json({ status: 500, message: error.message, success: false });
    }
}
