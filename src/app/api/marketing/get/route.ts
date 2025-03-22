import { NextRequest, NextResponse } from 'next/server';
import Marketing from '@/models/Marketing';
import { connect } from '@/dbConfig/dbConfig';

export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await connect();

    // Parse query parameters from the request URL
    const { searchParams } = new URL(req.url);
    const labelId = searchParams.get("labelId")?.toString() ?? "";
    const albumId = searchParams.get("albumId")?.toString() ?? "";

    console.log({
        labelId, albumId
    });
    

    // Validate labelId
    if (!labelId) {
      return NextResponse.json({
        message: 'labelId is required',
        success: false,
        status: 400,
      });
    }

    // Check if a specific marketing ID is passed
    if (albumId) {
      // Fetch marketing data by _id and labelId
      const marketingData = await Marketing.findOne({
        albumId: albumId,
        labelId: labelId
      });

      console.log("marketingData : ");
      console.log(marketingData);
      

      // If marketing data is not found
      if (!marketingData) {
        return NextResponse.json({
          message: 'No marketing data found for the provided ID',
          success: false,
          status: 404,
        });
      }

      return NextResponse.json({
        message: 'Marketing data retrieved successfully',
        data: marketingData,
        success: true,
        status: 200,
      });
    } else {
      // Fetch all marketing data by labelId
      const marketingDataList = await Marketing.find({
        labelId: labelId
      });

      // If no marketing data found for the labelId
      if (!marketingDataList || marketingDataList.length === 0) {
        return NextResponse.json({
          message: 'No marketing data found for the provided labelId',
          success: false,
          status: 404,
        });
      }

      return NextResponse.json({
        message: 'All marketing data retrieved successfully',
        data: marketingDataList,
        success: true,
        status: 200,
      });
    }

  } catch (error) {
    console.log("Error fetching marketing data: ", error);
    
    return NextResponse.json({
      message: 'Internal server error',
      success: false,
      status: 500,
    });
  }
}
