import { NextRequest, NextResponse } from 'next/server';
import Marketing from '@/models/Marketing';
import { connect } from '@/dbConfig/dbConfig';
import { uploadExtraFileToS3 } from '@/dbConfig/uploadFileToS3';

export async function POST(req: NextRequest) {
  try {
    await connect();

    // Parse FormData
    const formData = await req.formData();
    
    // Extract data from FormData
    const labelId = formData.get("labelId")?.toString() ?? "";
    const mood = formData.get("mood")?.toString() ?? "";
    const aboutArtist = formData.get("aboutArtist")?.toString() ?? "";
    const artistInstagramUrl = formData.get("artistInstagramUrl")?.toString() ?? "";
    const aboutSong = formData.get("aboutSong")?.toString() ?? "";
    const promotionLinks = formData.get("promotionLinks")?.toString() ?? "";
    const albumId = formData.get("albumId")?.toString() ?? "";
    const albumName = formData.get("albumName")?.toString() ?? "";
    // const isExtraFileRequested = formData.get("isExtraFileRequested") === "true"; // Handle as boolean
    // const comment = formData.get("comment")?.toString() ?? "";

  
    

    // Handle file upload if extraFile is provided
    const extraFile = formData.get("extraFile") as File | null;

    console.log("daata .. ");
    

    console.log({
        labelId,
      mood,
      aboutArtist,
      artistInstagramUrl,
      aboutSong,
      promotionLinks,
      extraFile,
      albumId,
      albumName,
      
});

    let uploadedFileName = '';
    
    if (extraFile) {
        const fileExtension = extraFile.name.split(".").pop(); 
        const fileBuffer = Buffer.from(await extraFile.arrayBuffer());
        const fileUploadResult = await uploadExtraFileToS3({
          file: fileBuffer, // Pass the buffer instead of File
          fileName: `albumPromotion-${albumName}.${fileExtension}`, // Unique name based on albumId
        });
      
        if (!fileUploadResult.status) {
          return NextResponse.json({
            message: 'File upload failed',
            success: false,
            status: 500,
          });
        }
      
        uploadedFileName = fileUploadResult.fileName; // Use uploaded file name
    }
      

    // Validate albumId
    if (!albumId) {
      return NextResponse.json({
        message: 'albumId is required',
        success: false,
        status: 400,
      });
    }

    // Check if a document with the given albumId already exists
    
    const existingMarketing = await Marketing.findOne({ albumId });
    console.log("existingMarketing : ");
    console.log(existingMarketing);
    

    if (existingMarketing) {
        console.log("extis data");
        
      // Update the existing record
     const updatedMarketing = await Marketing.findByIdAndUpdate(
        existingMarketing._id,
        {
          labelId,
          mood,
          aboutArtist,
          artistInstagramUrl,
          aboutSong,
          promotionLinks,
          extraFile: uploadedFileName || existingMarketing.extraFile, // Only update if new file is uploaded
          albumName
        },
        { new: true }
      );

      console.log("response update :");
      console.log(updatedMarketing);

      return NextResponse.json({
        message: 'Marketing data updated successfully',
        success: true,
        status: 200,
        data: updatedMarketing,
      });
    } else {
        console.log("new data");
        
      // Add new record
      const newMarketing = new Marketing({
        labelId,
        mood,
        aboutArtist,
        artistInstagramUrl,
        aboutSong,
        promotionLinks,
        extraFile: uploadedFileName || null, // Set the uploaded file name if exists
        albumId,
        albumName
      });

      const response = await newMarketing.save();
      console.log("response 1 :");
      console.log(response );
      
      

      return NextResponse.json({
        message: 'Marketing data added successfully',
        data: newMarketing,
        success: true,
        status: 200,
      });
    }

  } catch (error) {
    console.log("marketing api error here ");
    console.log(error);
    
    return NextResponse.json({
      message: 'Internal server error',
      success: false,
      status: 500,
    });
  }
}
