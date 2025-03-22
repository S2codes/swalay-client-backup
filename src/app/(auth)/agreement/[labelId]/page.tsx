"use client";
import { apiFormData, apiGet } from "@/helpers/axiosRequest"; // Assuming you have this helper for sending FormData
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

interface User {
  _id: string;
  username: string;
  usertype: string;
  lable: string;
  email: string;
  contact: number;
  joinedAt: Date;
}

function Agreement({ params }: { params: { labelId: string } }) {
  const [labelId, setLabelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null); // For file handling
  const [uploadDate, setUploadDate] = useState<string | null>(null);

  const router = useRouter();

  // 1. Handle labelid decoding
  useEffect(() => {
    try {
      // Ensure the labelId is properly Base64 encoded
      const decodedLabelId = atob(params.labelId);
      setLabelId(decodedLabelId);
    } catch (e) {
      console.error("Decoding error:", e);
      setError("Invalid label ID format.");
    }
  }, [params.labelId]);

  // 2. Fetch user details
  const fetchUserDetails = async () => {
    try {
      const response = await apiGet("/api/user/userdetails");
      if (response.success) {
        console.log("user details");
        console.log(response.data);
        
        const userInfo: User = response.data;
        setUser(userInfo);
      } else {
        toast.error("Invalid user");
        setUser(null);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error in loading current user");
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // 3. Handle file drop using react-dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setSignatureFile(acceptedFiles[0]);
      setUploadDate(new Date().toISOString());
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpg": [],
      "image/jpeg": [],
    },
    maxFiles: 1,
  });

  // 4. Clear uploaded file
  const clearSignature = () => {
    setSignatureFile(null);
    setUploadDate(null);
  };

  // 5. Handle form submission
  const handleSubmit = async () => {
    if (!signatureFile) {
      toast.error("Please upload your signature before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("labelId", labelId!); // Assuming labelId is not null when submitting
    formData.append("signature", signatureFile);

    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    try {
      const response = await apiFormData("/api/user/agreement", formData);
      console.log(response);

      if (response.success) {
        toast.success("Agreement successfully submitted!");
        router.push("/");
      } else {
        toast.error("Failed to submit agreement.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error in submitting the agreement.");
    }
  };

  const formattedCurrentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-700 p-8">
      <div className="bg-white text-gray-900 rounded-lg shadow-2xl p-12 w-full max-w-5xl">
        <h1 className="text-4xl font-bold text-center mb-8">
          TO WHOMSOEVER IT MAY CONCERN
        </h1>

        {/* User data */}
        <p className="mb-6 text-lg leading-relaxed">
          This is to inform that we <strong>{" “ "}
            {user?.usertype === "normal"
              ? user?.username
              : user?.usertype === "super"
              ? user?.lable || user?.username
              : null}{" ” "}
          </strong>
          have licensed our content Exclusively to <strong> “ SwaLay Digital ” </strong>for monetization of content across any and all platforms and services including but not limited to CRBT, IVR Full Tracks (Operator Based) and OTT platforms (international, domestic), streaming services, video streaming/download etc across various services and all telecom operators for the territory of world, on terms as detailed below – 
        </p>
        <p className="mb-4 text-lg">
          <strong>License Type</strong> – Exclusive
        </p>
        <p className="mb-4 text-lg">
          <strong>Content</strong> – All Past catalogue and Future new releases.
        </p>
        <p className="mb-4 text-lg">
          <strong>Territory</strong> – Worldwide
        </p>
        <p className="mb-4 text-lg">
          <strong>Date of Signing </strong> –  {formattedCurrentDate}
        </p>

        <p className="mb-4 text-lg">
          <strong>Term</strong> – This B2B is valid from Date of Signing of this Document and valid till two year and will be auto renewed if not requested and agreed for termination on or before sixty days of expiry of this document in written by both the parties. 
        </p>

        <p className="mb-4 text-lg">
          <strong>Regards, </strong> <br /> 
          {user?.usertype === "normal"
              ? user?.username
              : user?.usertype === "super"
              ? user?.lable || user?.username
              : null}</p>

     


        <p className="mb-4 text-lg">
          <strong>Sign</strong>
        </p>

        {/* File upload section */}
        <div
          {...getRootProps({
            className:
              "border-2 border-gray-300 rounded-lg mt-4 mb-6 w-full h-56 flex items-center justify-center cursor-pointer",
          })}
        >
          <input {...getInputProps()} />
          {signatureFile ? (
            <p className="text-green-500">{signatureFile.name}</p>
          ) : (
            <p className="text-gray-500">
              Drag & drop a signature file, or click to select one
            </p>
          )}
        </div>

        <div className="flex justify-center space-x-4 mt-4">
          <button
            className={`px-6 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-700 transition ${
              !signatureFile ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!signatureFile}
            onClick={handleSubmit}
          >
            I Agree
          </button>
          <button
            onClick={clearSignature}
            className="px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-700 transition"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default Agreement;
