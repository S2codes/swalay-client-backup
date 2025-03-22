"use client";
import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useContext,
} from "react";
import Dropzone from "react-dropzone";
import ErrorSection from "@/components/ErrorSection";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFormData, apiGet } from "@/helpers/axiosRequest";
import UserContext from "@/context/userContext";
import Loading from "@/components/ui/Loading";

interface FormData {
  mood: string;
  aboutArtist: string;
  artistInstagramUrl: string;
  aboutSong: string;
  promotionLinks: string;
  extraFile: File | null;
}

interface FormErrors {
  mood?: string[];
  aboutArtist?: string[];
  artistInstagramUrl?: string[];
  aboutSong?: string[];
  promotionLinks?: string[];
  extraFile?: string[];
}

const page = ({ params }: { params: { albumid: string } }) => {
  const searchParams = useSearchParams();
  const albumName = searchParams.get("albumname");

  const context = useContext(UserContext);
  const labelId = context?.user?._id ?? "";

  const router = useRouter();

  const albumIdParams = params.albumid;
  const [albumId, setAlbumId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    mood: "",
    aboutArtist: "",
    artistInstagramUrl: "",
    aboutSong: "",
    promotionLinks: "",
    extraFile: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmit, setIsSubmit] = useState(false);
  const [isAlredeayExitst, setIsAlredeayExitst] = useState(false) // to toggle add or update in badge
  const [isRequestedFile, setIsRequestedFile] = useState({
    addFile: false,
    comment: "",
  });

  // Fetch data if albumId exists
  useEffect(() => {
    const fetchData = async (labelId: string, albumId: string) => {
      setIsLoading(true)
      try {
        console.log(`labelId: ${labelId}`);
        console.log(`albumId: ${albumId}`);

        const response = await apiGet(
          `/api/marketing/get?albumId=${albumId}&labelId=${labelId}`
        );
        console.log("Data from fetch response API:");
        console.log(response);
        
        if (response.success) {
          setFormData({
            mood: response.data.mood || "",
            aboutArtist: response.data.aboutArtist || "",
            artistInstagramUrl: response.data.artistInstagramUrl || "",
            aboutSong: response.data.aboutSong || "",
            promotionLinks: response.data.promotionLinks || "",
            extraFile: null, // You might want to handle the file differently
          });

          setIsRequestedFile({
            addFile: false,
            comment: response.data.comment,
          });
          setIsAlredeayExitst(true)
          setIsLoading(false)
        }
      } catch (error) {
        setIsLoading(false)
        console.log("Error fetching data");
      }
    };

    if (albumId && labelId) {
      fetchData(labelId, albumId);
    }
  }, [albumId, labelId]);

  // Function to handle input change
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Validate Instagram URL
  const validateInstagramUrl = (url: string): boolean => {
    const instagramPattern =
      /^(https?:\/\/)?(www\.)?instagram\.com\/([a-zA-Z0-9._-]+)\/?$/;
    return instagramPattern.test(url);
  };
  

  // Handle file validation with Dropzone
  const handleDrop = (acceptedFiles: File[]) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
      "video/mp4",
    ];

    const file = acceptedFiles[0];

    if (file && validTypes.includes(file.type)) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        extraFile: file,
      }));
      setErrors((prevErrors) => ({ ...prevErrors, extraFile: undefined }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        extraFile: [
          "Invalid file type. Please upload PDF, PPT, Word, PNG, JPG, or MP4 files.",
        ],
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // setIsSubmit(true);
    

    if (!validateInstagramUrl(formData.artistInstagramUrl.trim())) {
        toast.error("Invalid Instagram URL format");
        return; 
      }

    // Trim input and check for empty fields
    const trimmedFormData = {
      mood: formData.mood.trim(),
      aboutArtist: formData.aboutArtist.trim(),
      artistInstagramUrl: formData.artistInstagramUrl.trim(),
      aboutSong: formData.aboutSong.trim(),
      promotionLinks: formData.promotionLinks.trim(),
      extraFile: formData.extraFile,
    };

    const newErrors: FormErrors = {};

    if (!trimmedFormData.mood) {
      newErrors.mood = ["Mood is required"];
    }
    if (!trimmedFormData.aboutArtist) {
      newErrors.aboutArtist = ["About Artist is required"];
    }
    if (!trimmedFormData.artistInstagramUrl) {
      newErrors.artistInstagramUrl = ["Instagram URL is required"];
    }
    if (!trimmedFormData.aboutSong) {
      newErrors.aboutSong = ["About Song is required"];
    }

    setErrors(newErrors);

    // If there are any errors, stop submission
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill in the required fields");
      setIsSubmit(false);
      return;
    }

    // Prepare form data for submission
    const formDataToSubmit = new FormData();

    formDataToSubmit.append("albumName", albumName || "");
    formDataToSubmit.append("labelId", labelId);
    formDataToSubmit.append("albumId", albumId || "");

    formDataToSubmit.append("mood", trimmedFormData.mood);
    formDataToSubmit.append("aboutArtist", trimmedFormData.aboutArtist);
    formDataToSubmit.append(
      "artistInstagramUrl",
      trimmedFormData.artistInstagramUrl
    );
    formDataToSubmit.append("aboutSong", trimmedFormData.aboutSong);
    formDataToSubmit.append("promotionLinks", trimmedFormData.promotionLinks);

    if (trimmedFormData.extraFile) {
      formDataToSubmit.append("extraFile", trimmedFormData.extraFile);
    }

    try {
      const result = await apiFormData(`/api/marketing/add`, formDataToSubmit);
      console.log("marketing api result");
      console.log(result);
      

      if (result.success) {
        toast.success("Form submitted successfully!");
        router.push("/marketing");
        setIsSubmit(false);
      } else {
        toast.error("Internal server error");
        setIsSubmit(false);
      }
    } catch (error) {
      toast.error("Internal server error");
      setIsSubmit(false);
    }


  };

  useEffect(() => {
    const albumIdParams = params.albumid;
    try {
      const decodedAlbumId = atob(albumIdParams);
      setAlbumId(decodedAlbumId);
    } catch (e) {
      setError("Invalid Url");
      console.error("Decoding error:", e);
    }
  }, [albumIdParams]);

  useEffect(() => {
    if (
      !albumId ||
      albumId.trim() === "" ||
      !albumName ||
      albumName.trim() === ""
    ) {
      setError("Label ID and album Name must be set and cannot be blank.");
    } else {
      setError(null);
    }
  }, [albumId, albumName]);


  if (isLoading) {
    <Loading/>
  }

  if (error) {
    return <ErrorSection message="Invalid url" />;
  }

  return (
    <div className="w-full min-h-screen p-6 bg-white rounded-sm">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Marketing</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage> {isAlredeayExitst ? "Update" : "Add"} </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold mb-4 mt-5 text-blue-600">
        {albumId
          ? `Update Marketing for ${albumName}`
          : `Add New Marketing for ${albumName}`}
      </h1>

      {isRequestedFile && isRequestedFile.addFile && (
         <div id="alert-border-1" className={`w-100 flex items-center p-4 mb-4 text-yellow-800 border-t-4 border-yellow-300 bg-yellow-50 dark:text-yellow-400 dark:bg-gray-800 dark:border-yellow-800`} role="alert">
         <div className="ms-3 text-sm font-medium">
           <span className="font-bold "> Alert : </span>{isRequestedFile.comment}
         </div>
       </div>
      )}
      


      <form onSubmit={handleSubmit} className="w-full">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            {/* Mood */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mood
              </label>
              <select
                name="mood"
                value={formData.mood}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="" disabled>
                  Select mood
                </option>
                <option value="Romantic">Romantic</option>
                <option value="Happy">Happy</option>
                <option value="Sad">Sad</option>
                <option value="Energetic">Energetic</option>
                <option value="Devotional">Devotional</option>
                <option value="Old Melodies">Old Melodies</option>
              </select>
              {errors.mood && (
                <p className="text-red-500 text-sm mt-1">{errors.mood[0]}</p>
              )}
            </div>

            {albumId && (
              <input
                type="hidden"
                name="albumid"
                readOnly
                value={albumId}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none sm:text-sm"
                placeholder="Album ID"
              />
            )}

            {/* About Artist */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                About Artist
              </label>
              <textarea
                name="aboutArtist"
                value={formData.aboutArtist}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Write about the artist"
                required
              />
              {errors.aboutArtist && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.aboutArtist[0]}
                </p>
              )}
            </div>

            {/* Artist Instagram URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Artist Instagram URL
              </label>
              <input
                required
                type="url"
                name="artistInstagramUrl"
                value={formData.artistInstagramUrl}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                 placeholder="Enter Instagram URL (e.g., https://www.instagram.com/username)"
              />
              {errors.artistInstagramUrl && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.artistInstagramUrl[0]}
                </p>
              )}
            </div>

            {/* Promotion Links / Music Video Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Promotion Links / Music Video Link
              </label>
              <input
                type="url"
                name="promotionLinks"
                value={formData.promotionLinks}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter link (e.g., YouTube, Instagram, Spotify)"
              />

              {errors.promotionLinks && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.promotionLinks[0]}
                </p>
              )}
            </div>
          </div>

          <div className="col-span-4 space-y-6">
            {/* About Song */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                About Album
              </label>
              <textarea
                name="aboutSong"
                value={formData.aboutSong}
                rows={5}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Write about the album"
                required
              />
              {errors.aboutSong && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.aboutSong[0]}
                </p>
              )}
            </div>

            {/* Add File with Dropzone */}

            {isRequestedFile.addFile && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add File
                </label>
                <p>{isRequestedFile.comment}</p>
                <Dropzone onDrop={handleDrop}>
                  {({ getRootProps, getInputProps }) => (
                    <div
                      {...getRootProps()}
                      className="dropzone border-2 border-dashed rounded-lg p-4 cursor-pointer"
                    >
                      <input {...getInputProps()} />
                      <p>Drag & drop a file here, or click to select one.</p>
                      {formData.extraFile && (
                        <p className="text-green-600 mt-2">
                          {formData.extraFile.name}
                        </p>
                      )}
                    </div>
                  )}
                </Dropzone>
                {errors.extraFile && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.extraFile[0]}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              className="mt-6 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmit}
            >
              {isSubmit ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default page;
