import { S3Client, 
  PutObjectCommand,

  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,


 } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
  },
});

/**
 * Uploads a file to S3.
 * @param {Buffer} file - The file buffer to upload.
 * @param {string} fileName - The name of the file.
 * @param {string} folderName - The folder name in the S3 bucket.
 *  @returns {Promise<{status: boolean, fileName: string}>} - The upload status and file name.
 */

// Define types for the parameters
type UploadFileToS3Params = {
  file: Buffer;
  fileName: string;
  folderName: string;
};

// Uploads a file to S3
export async function uploadFileToS3({
  file,
  fileName,
  folderName,
}: UploadFileToS3Params): Promise<{ status: boolean; fileName: string }> {
  try {
    const fileBuffer = file;
    const uploadFilePath = `albums/07c1a${folderName}ba3/cover/${fileName}`;

    const fileExtension = fileName.split(".").pop();
    let contentType = ""; // Default content type

    switch (fileExtension) {
      case "png":
        contentType = "image/png";
        break;
      case "jpeg":
      case "jpg":
        contentType = "image/jpeg";
        break;
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: uploadFilePath,
      Body: fileBuffer,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return { status: true, fileName };
  } catch (error: any) {
    return { status: true, fileName };
  }
}

// export async function uploadTrackToS3({
//   file,
//   fileName,
//   folderName,
// }: UploadFileToS3Params): Promise<{ status: boolean; fileName: string }> {
//   try {
//     const fileBuffer = file;
//     const uploadFilePath = `albums/07c1a${folderName}ba3/tracks/${fileName}`;

//     // Determine the content type based on the file extension
//     const fileExtension = fileName.split(".").pop();
//     let contentType = "application/octet-stream"; // Default content type

//     switch (fileExtension) {
//       case "mp3":
//         contentType = "audio/mpeg";
//         break;
//       case "wav":
//         contentType = "audio/wav";
//         break;
//       case "flac":
//         contentType = "audio/flac";
//         break;
//       // Add more cases as needed
//       default:
//         contentType = "application/octet-stream";
//     }

//     const params = {
//       Bucket: process.env.AWS_S3_BUCKET_NAME,
//       Key: uploadFilePath,
//       Body: fileBuffer,
//       ContentType: contentType,
//     };

//     const command = new PutObjectCommand(params);
//     await s3Client.send(command);
//     return { status: true, fileName };
//   } catch (error: any) {
//     return { status: true, fileName };
//   }
// }




export async function uploadTrackToS3({
  file,
  fileName,
  folderName,
}: UploadFileToS3Params): Promise<{ status: boolean; fileName: string }> {
  let UploadId: string | undefined;
  let uploadFilePath: string | undefined;

  try {
    const fileBuffer = file;
    uploadFilePath = `albums/07c1a${folderName}ba3/tracks/${fileName}`;

    // Determine the content type based on the file extension
    const fileExtension = fileName.split(".").pop();
    let contentType = "application/octet-stream"; // Default content type

    switch (fileExtension) {
      case "mp3":
        contentType = "audio/mpeg";
        break;
      case "wav":
        contentType = "audio/wav";
        break;
      case "flac":
        contentType = "audio/flac";
        break;
      // Add more cases as needed
      default:
        contentType = "application/octet-stream";
    }

    // Step 1: Initiate Multipart Upload
    const createMultipartUploadResponse = await s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: uploadFilePath,
        ContentType: contentType,
      })
    );

    UploadId = createMultipartUploadResponse.UploadId;

    if (!UploadId) {
      throw new Error("Failed to initiate multipart upload");
    }

    // Step 2: Upload Parts
    const partSize = 5 * 1024 * 1024; // 5 MB per part (adjust as needed)
    const parts = [];
    let partNumber = 1;

    for (let start = 0; start < fileBuffer.length; start += partSize) {
      const end = Math.min(start + partSize, fileBuffer.length);
      const chunk = fileBuffer.slice(start, end);

      const uploadPartResponse = await s3Client.send(
        new UploadPartCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: uploadFilePath,
          PartNumber: partNumber,
          UploadId,
          Body: chunk,
        })
      );

      if (!uploadPartResponse.ETag) {
        throw new Error(`Failed to upload part ${partNumber}`);
      }

      parts.push({ ETag: uploadPartResponse.ETag, PartNumber: partNumber });
      partNumber++;
    }

    // Step 3: Complete Multipart Upload
    await s3Client.send(
      new CompleteMultipartUploadCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: uploadFilePath,
        UploadId,
        MultipartUpload: { Parts: parts },
      })
    );

    return { status: true, fileName };
  } catch (error: any) {
    // Step 4: Abort Multipart Upload in case of failure
    if (UploadId && uploadFilePath) {
      await s3Client.send(
        new AbortMultipartUploadCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: uploadFilePath,
          UploadId,
        })
      );
    }

    console.error("Error uploading file to S3:", error);
    return { status: false, fileName };
  }
}







// upload extra file for marketing 

type UploadMarketingFileToS3Params = {
  file: Buffer;
  fileName: string;
};


export async function uploadExtraFileToS3({
  file,
  fileName,
}: UploadMarketingFileToS3Params): Promise<{ status: boolean; fileName: string }> {
  try {
    const fileBuffer = file;
    const uploadFilePath = `labels/marketing/${fileName}`;

    // Determine the content type based on the file extension
    const fileExtension = fileName.split(".").pop();
    let contentType = "application/octet-stream"; // Default content type

    switch (fileExtension) {
      case "mp3":
        contentType = "audio/mpeg";
        break;
      case "wav":
        contentType = "audio/wav";
        break;
      case "flac":
        contentType = "audio/flac";
        break;
      case "pdf":
        contentType = "application/pdf";
        break;
      case "ppt":
      case "pptx":
        contentType = "application/vnd.ms-powerpoint";
        break;
      case "doc":
      case "docx":
        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        break;
      case "png":
        contentType = "image/png";
        break;
      case "jpeg":
      case "jpg":
        contentType = "image/jpeg";
        break;
      case "mp4":
        contentType = "video/mp4";
        break;
      default:
        contentType = "application/octet-stream"; // Default content type for unhandled extensions
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: uploadFilePath,
      Body: fileBuffer,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return { status: true, fileName };
  } catch (error: any) {
    console.error("Error uploading file to S3:", error);
    return { status: false, fileName };
  }
}

// upload artist profile image


type UploadArtistProfileToS3Params = {
  file: Buffer;
  fileName: string;
};


export async function uploadArtistProfileToS3({
  file,
  fileName,
}: UploadArtistProfileToS3Params): Promise<{ status: boolean; fileName: string }> {
  try {
    const fileBuffer = file;
    const uploadFilePath = `labels/artist/${fileName}`;

    // Determine the content type based on the file extension
    const fileExtension = fileName.split(".").pop();
    let contentType = ""; // Default content type

    switch (fileExtension) {
      case "png":
        contentType = "image/png";
        break;
      case "jpeg":
      case "jpg":
        contentType = "image/jpeg";
        break;
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: uploadFilePath,
      Body: fileBuffer,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return { status: true, fileName };
  } catch (error: any) {
    console.error("Error uploading file to S3:", error);
    return { status: false, fileName };
  }
}

//! Upolad signature to s3

type UploadLabelSignatureS3Params = {
  file: Buffer;
  fileName: string;
};
export async function UploadLabelSignatureAgrrementS3Params({
  file,
  fileName,
}: UploadLabelSignatureS3Params): Promise<{ status: boolean; fileName: string }> {
  try {
    const fileBuffer = file;
    const uploadFilePath = `labels/signature/${fileName}`;

    // Determine the content type based on the file extension
    const fileExtension = fileName.split(".").pop();
    let contentType = ""; // Default content type

    switch (fileExtension) {
      case "png":
        contentType = "image/png";
        break;
      case "jpeg":
      case "jpg":
        contentType = "image/jpeg";
        break;
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: uploadFilePath,
      Body: fileBuffer,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return { status: true, fileName };
  } catch (error: any) {
    console.error("Error uploading file to S3:", error);
    return { status: false, fileName };
  }
}


