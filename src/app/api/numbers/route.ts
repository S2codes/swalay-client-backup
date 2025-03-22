import { NextRequest, NextResponse } from 'next/server';
import Album, { AlbumStatus } from '@/models/albums';
import { connect } from '@/dbConfig/dbConfig';
import TotalBalance from '@/models/totalBalance';
import Artist from '@/models/Artists';


export async function GET(request: NextRequest) {
  try {
    await connect();

    const labelId = request.nextUrl.searchParams.get("labelId");

    if (!labelId) {
      return NextResponse.json({
        message: "Label ID is required",
        success: false,
        status: 400,
      });
    }

    // Get all album IDs under the specific labelId
    const albumIds = await Album.find({ labelId }).distinct('_id');

    // Count the total albums
    const totalAlbums = albumIds.length;

    // Count the unique artists under the labelId
    const totalArtists = await Artist.countDocuments({ labelId });

    // Fetch the total balance for the specific labelId
    const totalBalance = await TotalBalance.findOne({ labelId }).then(balance => balance ? balance.totalBalance : 0);
    
    

    // Count the albums with status 'Processing'
    const upcomingReleases = await Album.countDocuments({ labelId, status: AlbumStatus.Processing });

    const data = {
      totalAlbums,
      totalArtist: totalArtists,
      totalBalance,
      upcomingReleases,
    };

    return NextResponse.json({
      message: "Numbers are fetched",
      success: true,
      status: 200,
      data: data,
    });

  } catch (error) {
    return NextResponse.json({
      message: "Internal Server Error",
      success: false,
      status: 500,
    });
  }
}
