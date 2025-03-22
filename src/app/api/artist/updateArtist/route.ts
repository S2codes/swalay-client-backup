import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Artist from "@/models/Artists";
import { uploadArtistProfileToS3 } from "@/dbConfig/uploadFileToS3";



export async function POST(request: NextRequest) {
  try {
    await connect(); // Connect to the database

    // Parse the request
    const formData = await request.formData();

    // Extract fields from formData
    const artistId = formData.get("artistId") as string;
    const artistName = formData.get("artistName") as string;
    const iprs = formData.get("iprs") === "true" ? true : false;
    const iprsNumber = formData.get("iprsNumber") as string | "";
    const facebook = formData.get("facebook") as string | "";
    const appleMusic = formData.get("appleMusic") as string | "";
    const spotify = formData.get("spotify") as string | "";
    const instagram = formData.get("instagram") as string | "";
    const youtube = formData.get("youtube") as string | "";
    const xTwitter = formData.get("xTwitter") as string | "";
    const isSinger = formData.get("isSinger") === "true" ? true : false;
    const isLyricist = formData.get("isLyricist") === "true" ? true : false;
    const isComposer = formData.get("isComposer") === "true" ? true : false;
    const isProducer = formData.get("isProducer") === "true" ? true : false;
    const about = formData.get("about") as string | "";
    const contact = formData.get("contact") as string | "";
    const email = formData.get("email") as string | "";

    let profileImage = "";
    const profileImageFile = formData.get("profileImage") as File | null;

    console.log("profileImageFile : ");
    console.log(profileImageFile);
    

    if (profileImageFile) {
      console.log("profile image set");
      
      let buffer;
      try {
        buffer = Buffer.from(await profileImageFile.arrayBuffer());
      } catch (error) {
        return NextResponse.json({
          message: "Failed to process the profile image file",
          success: false,
          status: 500,
        });
      }

      const timestamp = Date.now();
      const fileExtension = profileImageFile.name.split(".").pop();
      const profileImageName = `${artistName}-${timestamp}.${fileExtension}`;

      const uploadResponse = await uploadArtistProfileToS3({
        file: buffer,
        fileName: profileImageName,
      });

      if (!uploadResponse.status) {
        return NextResponse.json({
          message: "Failed to upload profile image",
          success: false,
        }, { status: 500 });
      }

      profileImage = uploadResponse.fileName;
    }

    const updateData: any = {
      artistName,
      iprs,
      iprsNumber,
      facebook,
      appleMusic,
      spotify,
      instagram,
      youtube,
      xTwitter,
      isSinger,
      isLyricist,
      isComposer,
      isProducer,
      about,
      contact,
      email,
    };

    if (profileImage) {
      updateData.profileImage = profileImage;
    }

    const updatedArtist = await Artist.findByIdAndUpdate(
      artistId,
      updateData,
      { new: true }
    );

    if (!updatedArtist) {
      return NextResponse.json({
        message: "Artist not found",
        success: false,
      }, { status: 404 });
    }

    return NextResponse.json({
      message: "Artist updated successfully",
      data: updatedArtist,
      success: true,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error updating artist:", error);
    return NextResponse.json({
      error: error.message || "An unknown error occurred",
      success: false,
    }, { status: 500 });
  }
}



