import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { UploadLabelSignatureAgrrementS3Params } from "@/dbConfig/uploadFileToS3";
import Label from "@/models/Label";

export async function POST(request: NextRequest) {
    try {
        await connect();

        const formData = await request.formData();
        const labelId = formData.get("labelId")?.toString() ?? "";
        const signature = formData.get("signature") as File;

        if (!signature) {
            return NextResponse.json({
                message: "Signature file is required",
                success: false,
                status: 400,
            });
        }

        const buffer = Buffer.from(await signature.arrayBuffer());
        const timestamp = Date.now();
        const fileExtension = signature.name.split(".").pop();
        const signatureName = `signature-${timestamp}.${fileExtension}`;

        // Assuming this function uploads the file and returns the result
        const uploadResult = await UploadLabelSignatureAgrrementS3Params({
            file: buffer,
            fileName: signatureName,
        });

        // Update the label document with the uploaded signature file name
        const result = await Label.findByIdAndUpdate(
            labelId,
            { signature: uploadResult.fileName }, // Correctly format the update object
            { new: true } 
        );

        return NextResponse.json({
            message: "Signature uploaded and label updated successfully",
            success: true,
            data: result, // Optionally return the updated label data
            status: 200,
        });

    } catch (error: any) {
        console.error("Error uploading signature:", error);

        return NextResponse.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
}
