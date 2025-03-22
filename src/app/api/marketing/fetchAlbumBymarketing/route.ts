import { NextRequest, NextResponse } from 'next/server';
import Album, { AlbumStatus } from '@/models/albums';
import { connect } from '@/dbConfig/dbConfig';
import Marketing from '@/models/Marketing';

export async function GET(req: NextRequest) {
  await connect();

  // Extract query parameters
  const labelId = req.nextUrl.searchParams.get("labelId");
  const status = "Approved";

  // Build the query object
  let query: any = {};

  if (labelId) {
    query.labelId = labelId;
  }

  const statusEnumValue = AlbumStatus[status as keyof typeof AlbumStatus];
  query.status = statusEnumValue;

  try {
    // Fetch albums based on query
    const albums = await Album.find(query).sort({ _id: -1 });

    if (!albums || albums.length === 0) {
      return NextResponse.json({
        message: "No albums found",
        success: true,
        status: 404,
      });
    }

    // Iterate through each album and fetch related marketing details
    const albumsWithMarketingStatus = await Promise.all(
      albums.map(async (album) => {
        // Fetch marketing details for the current album
        const marketing = await Marketing.findOne({ albumId: album._id });

        let marketingStatus = "Not Pitched"; // Default to "Not Pitched"

        if (marketing) {
          // If marketing is found, set status to "Pitched"
          marketingStatus = "Pitched";
          
          // If extra file is requested, set status to "Requested"
          if (marketing.isExtraFileRequested) {
            marketingStatus = "Requested";
          }
        }

        // Add marketing status to the album object
        return {
          ...album.toObject(),
          marketingStatus,
        };
      })
    );

    return NextResponse.json({
      message: "Albums are found",
      success: true,
      status: 200,
      data: albumsWithMarketingStatus,
    });
  } catch (error) {
    console.error("Internal Server Error:", error);

    return NextResponse.json({
      message: "Internal server down",
      success: false,
      status: 500,
    });
  }
}
