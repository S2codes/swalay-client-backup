import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Album, { AlbumStatus } from '@/models/albums'; // Path to your Album model
import Label from '@/models/Label'; // Path to your Label model
import { Resend } from 'resend'; // Ensure the Resend package is installed
import { connect } from '@/dbConfig/dbConfig';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  await connect(); // Ensure your database connection is established

  try {
    const { id, status, comment } = await req.json();

    // Validate inputs
    if (!id || status === undefined || (status === AlbumStatus.Rejected && !comment)) {
      return NextResponse.json({
        message: 'Missing required fields',
        success: false,
      });
    }

    // Validate the status value
    if (!Object.values(AlbumStatus).includes(status)) {
      return NextResponse.json({
        message: 'Invalid status value',
        success: false,
      });
    }

    // Validate the album ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        message: 'Invalid album ID',
        success: false,
      });
    }

    // Update the album status
    const album = await Album.findByIdAndUpdate(
      id,
      { status, comment },
      { new: true }
    );

    if (!album) {
      return NextResponse.json({
        message: 'Album not found',
        success: false,
      });
    }

    // If status is 'Rejected', find the associated label and send an email
    if (status === AlbumStatus.Rejected) {
      const label = await Label.findById(album.labelId);

      if (label) {
        await resend.emails.send({
          from: 'SwaLay India <swalay.care@talantoncore.in>',
          to: label.email,
          subject: 'Action Required: Album Rejected',
          html: `<p>Dear ${label.username},</p>
                 <p>We regret to inform you that your recently submitted album, <strong>${album.title}</strong>, has been rejected as it did not pass the 3-step industry verification process for uploaded content. Kindly update the following changes and resubmit the album for verification.</p>
                 <p><strong>Reason for Rejection:</strong> ${comment}</p>
                 <p>To avoid further content rejections, we strongly recommend reviewing the content guidelines published by SwaLay.</p>
                 <p>Best regards,<br>SwaLay India<br><a href="mailto:swalay.care@talantoncore.in">swalay.care@talantoncore.in</a></p>`,
        });
      }
    }

    return NextResponse.json({
      message: 'Album status updated successfully',
      success: true,
    });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({
      message: 'Internal server error',
      success: false,
      status: 500,
    });
  }
}
