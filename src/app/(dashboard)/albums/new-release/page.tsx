"use client";
import React, { useState, ChangeEvent, FormEvent, useContext } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useDropzone } from "react-dropzone";
import UserContext from "@/context/userContext";
import { MultiSelect } from "react-multi-select-component";
import toast from "react-hot-toast";
import { apiFormData } from "@/helpers/axiosRequest";
import { useRouter } from "next/navigation";
import Uploading from "@/components/Uploading";
// import { albumSchema } from '../../../Schema/albumSchema';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faUpload } from '@fortawesome/free-solid-svg-icons';

interface FormData {
  title: string;
  releaseDate: string;
  artist: string;
  genre: string;
  label: string;
  language: string;
  artwork: File | null;
  pLine: string;
  cLine: string;
}

type TagOption = {
  label: string;
  value: string;
};

const AlbumForm: React.FC = () => {
  const context = useContext(UserContext);
  
  const labelId = context?.user?._id ?? "";

  const year = new Date().getFullYear();
  const userLable = context?.user?.lable || "";

  const labelLine =
    context?.user?.usertype === "normal"  ? `${year} SwaLay Digital` : `${year} ${userLable}`;

    const userMusiclabel = context?.user?.usertype === "normal" 
  ? "SwaLay Digital" 
  : userLable;

  const router = useRouter();

  // useState hook to manage the form data
  const [formData, setFormData] = useState<FormData>({
    title: "",
    releaseDate: "",
    artist: "",
    genre: "",
    label: userMusiclabel,
    language: "",
    artwork: null,
    pLine: labelLine,
    cLine: labelLine,
  });

  const albumTags = [
   { label: "Romantic", value: "Romantic" },
    { label: "Happy", value: "Happy" },
    { label: "Sad", value: "Sad" },
    { label: "Dance", value: "Dance" },
    { label: "Bhangra", value: "Bhangra" },
    { label: "Partiotic", value: "Partiotic" },
    { label: "Nostalgic", value: "Nostalgic" },
    { label: "Inspirational", value: "Inspirational" },
    { label: "Enthusiastic", value: "Enthusiastic" },
    { label: "Optimistic", value: "Optimistic" },
    { label: "Passion", value: "Passion" },
    { label: "Pessimistic", value: "Pessimistic" },
    { label: "Spiritual", value: "Spiritual" },
    { label: "Peppy", value: "Peppy" },
    { label: "Philosophical", value: "Philosophical" },
    { label: "Mellow", value: "Mellow" },
    { label: "Calm", value: "Calm" },
  ];
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleSelectChange = (selectedItems: TagOption[]) => {
    if (selectedItems.length > 3) {
      toast.error("You can select a maximum of 3 Tags.");
    } else {
      setSelectedTags(selectedItems);
    }
  };

  // useState hook to manage form validation errors
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

  // Handling file drop for artwork
  const onDrop = (acceptedFiles: File[]) => {
    setFormData({ ...formData, artwork: acceptedFiles[0] });
  };

  // useDropzone hook for handling file uploads
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    multiple: false,
  });

  // Handling changes to form input fields
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Check if the selected date is within the next 5 days
    if (name === "releaseDate") {
      const selectedDate = new Date(value);
      const today = new Date();
      const fiveDaysFromNow = new Date();
      fiveDaysFromNow.setDate(today.getDate() + 5);

      if (selectedDate >= today && selectedDate <= fiveDaysFromNow) {
        toast.error(
          "Release date must be at least 5 days from today To ensure smooth content delivery and an on-time album release"
        );
      }
    }
  };

  // Handling form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const loadingToastId = toast.loading("Uploading...");
    setIsUploading(true);
    try {
      const artwork = formData.artwork;

      if (!artwork) {
        toast.error("Album cover image is required");
        setIsUploading(false);
        return;
      }

      // File type check
      if (!["image/jpeg", "image/png"].includes(artwork.type)) {
        toast.error("Invalid file type. Only JPEG and PNG are allowed.");
        setIsUploading(false);
        return;
      }

      //! Dimension check need to be done if dimension preferred **
      const image = new Image();
      const imageLoaded = new Promise<void>((resolve, reject) => {
        image.onload = () => {
          if (image.width !== 3000 || image.height !== 3000) {
            reject(
              new Error(
                "Invalid image dimensions. Image must be 3000x3000 pixels."
              )
            );
          } else {
            resolve();
          }
        };
        image.onerror = () => {
          reject(new Error("Failed to load image"));
        };
      });

      image.src = URL.createObjectURL(artwork);

      try {
        await imageLoaded; // Wait for the image to load and validate dimensions
      } catch (error: any) {
        toast.error(error.message);
        setIsUploading(false);
        return; // Exit the function if dimensions are invalid
      }

      const selectedTagValues = selectedTags.map((tag) => tag.value);

      // Create FormData object
      const formDataObj = new FormData();
      formDataObj.append("labelId", labelId);
      formDataObj.append("title", formData.title);
      formDataObj.append("releaseDate", formData.releaseDate);
      formDataObj.append("artist", formData.artist);
      formDataObj.append("genre", formData.genre);
      formDataObj.append("label", formData.label);
      formDataObj.append("language", formData.language);
      formDataObj.append("pLine", formData.pLine);
      formDataObj.append("cLine", formData.cLine);
      formDataObj.append("tags", JSON.stringify(selectedTagValues));
      formDataObj.append("artwork", artwork);

      const response = await apiFormData("/api/albums/addAlbum", formDataObj);

      toast.dismiss(loadingToastId);
      if (response.success) {
        setIsUploading(false);
        toast.success("😉 Success! Album added");
        router.push(`/albums/viewalbum/${btoa(response.data._id)}`);
        setFormData({
          title: "",
          releaseDate: "",
          artist: "",
          genre: "",
          label: "SwaLay Digital",
          language: "",
          artwork: null,
          pLine: labelLine,
          cLine: labelLine,
        });
        setSelectedTags([]);
      } else {
        console.log("Invalid token");
        toast.error("Invalid Token", {
          id: loadingToastId,
        });
      }
    } catch (error: any) {
      setIsUploading(false);
      if (error.name === "ValidationError") {
        const fieldErrors: { [key: string]: string[] } = {};
        for (const field in error.formErrors.fieldErrors) {
          fieldErrors[field] = error.formErrors.fieldErrors[field].map(
            (err: any) => err.message
          );
        }
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <div className="w-full min-h-screen p-6 bg-white rounded-sm ">
      {!isUploading && (
        <>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Albums</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>New Release</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-3xl font-bold mb-4 mt-5 text-blue-600">
            Album Details
          </h1>

          <form onSubmit={handleSubmit} className="w-full ">
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 "> */}
            <div className="grid grid-cols-12 gap-6 ">
              <div className="col-span-8 space-y-6 ">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Song Title <span className="formRequired" title="Required field"></span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Title of Album or Song"
                    required
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.title[0]}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Main Artist <span className="formRequired" title="Required field"></span>
                    </label>
                    <input
                      type="text"
                      name="artist"
                      value={formData.artist}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Name of Artist"
                      required
                    />
                    {errors.artist && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.artist[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Genre <span className="formRequired" title="Required field"></span>
                    </label>
                    <select
                      name="genre"
                      value={formData.genre}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    >
                      <option value="">Select Genre</option>
                      <option value="Pop">Pop</option>
                      <option value="Film"> Film</option>
                      <option value="Folk"> Folk</option>
                      <option value="Devotional"> Devotional</option>
                      <option value="Traditional"> Traditional</option>
                      <option value="Instrumental"> Instrumental</option>
                      <option value="Western Classical">
                        {" "}
                        Western Classical
                      </option>
                      <option value="Carnatic Classical">
                        Carnatic Classical
                      </option>
                      <option value="Hindustani Classical">
                        Hindustani Classical
                      </option>
                      <option value="Spiritual"> Spiritual</option>
                      <option value="English Pop"> English Pop</option>
                      <option value="Gazal"> Gazal</option>
                      <option value="Regional Pop"> Regional Pop</option>
                      <option value="Patriotic Pop"> Patriotic Pop</option>
                      <option value="Lounge"> Lounge</option>
                      <option value="Fusion"> Fusion</option>
                      <option value="Electronic"> Electronic</option>
                      <option value="Hip Hop"> Hip Hop</option>
                      <option value="Rock"> Rock</option>
                      <option value="Alternative"> Alternative</option>
                    </select>
                    {errors.genre && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.genre[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Release Date <span className="formRequired" title="Required field"></span>
                    </label>
                    <input
                      type="date"
                      name="releaseDate"
                      value={formData.releaseDate}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                    {errors.releaseDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.releaseDate[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Language <span className="formRequired" title="Required field"></span>
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    >
                      <option value="">Select Song Language</option>
                      

                        <option label="Ahirani" value="Ahirani">Ahirani</option>
                        <option label="Arabic" value="Arabic">Arabic</option>
                        <option label="Assamese" value="Assamese">Assamese</option>
                        <option label="Awadhi" value="Awadhi">Awadhi</option>
                        <option label="Banjara" value="Banjara">Banjara</option>
                        <option label="Bengali" value="Bengali">Bengali</option>
                        <option label="Bhojpuri" value="Bhojpuri">Bhojpuri</option>
                        <option label="Burmese" value="Burmese">Burmese</option>
                        <option label="Chhattisgarhi" value="Chhattisgarhi">Chhattisgarhi</option>
                        <option label="Chinese" value="Chinese">Chinese</option>
                        <option label="Dogri" value="Dogri">Dogri</option>
                        <option label="English" value="English">English</option>
                        <option label="French" value="French">French</option>
                        <option label="Garhwali" value="Garhwali">Garhwali</option>
                        <option label="Garo" value="Garo">Garo</option>
                        <option label="Gujarati" value="Gujarati">Gujarati</option>
                        <option label="Haryanvi" value="Haryanvi">Haryanvi</option>
                        <option label="Himachali" value="Himachali">Himachali</option>
                        <option label="Hindi" value="Hindi">Hindi</option>
                        <option label="Iban" value="Iban">Iban</option>
                        <option label="Indonesian" value="Indonesian">Indonesian</option>
                        <option label="Instrumental" value="Instrumental">Instrumental</option>
                        <option label="Italian" value="Italian">Italian</option>
                        <option label="Japanese" value="Japanese">Japanese</option>
                        <option label="Javanese" value="Javanese">Javanese</option>
                        <option label="Kannada" value="Kannada">Kannada</option>
                        <option label="Kashmiri" value="Kashmiri">Kashmiri</option>
                        <option label="Khasi" value="Khasi">Khasi</option>
                        <option label="Kokborok" value="Kokborok">Kokborok</option>
                        <option label="Konkani" value="Konkani">Konkani</option>
                        <option label="Korean" value="Korean">Korean</option>
                        <option label="Kumauni" value="Kumauni">Kumauni</option>
                        <option label="Latin" value="Latin">Latin</option>
                        <option label="Maithili" value="Maithili">Maithili</option>
                        <option label="Malay" value="Malay">Malay</option>
                        <option label="Malayalam" value="Malayalam">Malayalam</option>
                        <option label="Mandarin" value="Mandarin">Mandarin</option>
                        <option label="Manipuri" value="Manipuri">Manipuri</option>
                        <option label="Marathi" value="Marathi">Marathi</option>
                        <option label="Marwari" value="Marwari">Marwari</option>
                        <option label="Naga" value="Naga">Naga</option>
                        <option label="Nagpuri" value="Nagpuri">Nagpuri</option>
                        <option label="Nepali" value="Nepali">Nepali</option>
                        <option label="Odia" value="Odia">Odia</option>
                        <option label="Pali" value="Pali">Pali</option>
                        <option label="Persian" value="Persian">Persian</option>
                        <option label="Punjabi" value="Punjabi">Punjabi</option>
                        <option label="Rajasthani" value="Rajasthani">Rajasthani</option>
                        <option label="Sainthili" value="Sainthili">Sainthili</option>
                        <option label="Sambalpuri" value="Sambalpuri">Sambalpuri</option>
                        <option label="Sanskrit" value="Sanskrit">Sanskrit</option>
                        <option label="Santali" value="Santali">Santali</option>
                        <option label="Sindhi" value="Sindhi">Sindhi</option>
                        <option label="Sinhala" value="Sinhala">Sinhala</option>
                        <option label="Spanish" value="Spanish">Spanish</option>
                        <option label="Swahili" value="Swahili">Swahili</option>
                        <option label="Tamil" value="Tamil">Tamil</option>
                        <option label="Telugu" value="Telugu">Telugu</option>
                        <option label="Thai" value="Thai">Thai</option>
                        <option label="Tibetan" value="Tibetan">Tibetan</option>
                        <option label="Tulu" value="Tulu">Tulu</option>
                        <option label="Turkish" value="Turkish">Turkish</option>
                        <option label="Ukrainian" value="Ukrainian">Ukrainian</option>
                        <option label="Urdu" value="Urdu">Urdu</option>
                        <option label="Zxx" value="Zxx">Zxx</option>



                    </select>
                    {errors.language && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.language[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      P Line <span className="formRequired" title="Required field"></span>
                    </label>

                    <select
                      name="pLine"
                      defaultValue={formData.pLine}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    >
                      <option value={formData.pLine}>℗ {formData.pLine}</option>
                    </select>

                    {errors.pLine && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.pLine[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      C Line <span className="formRequired" title="Required field"></span>
                    </label>
                    <select
                      name="cLine"
                      defaultValue={formData.cLine}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    >
                      <option value={formData.cLine}>© {formData.pLine}</option>
                    </select>
                    {errors.cLine && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.cLine[0]}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-4 space-y-6 ">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>

                  <div>
                    <MultiSelect
                      hasSelectAll={false}
                      options={albumTags}
                      value={selectedTags}
                      onChange={handleSelectChange}
                      labelledBy="Select"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Album Cover (File Type: png, jpg | File Size: 3000 x 3000) <span className="formRequired" title="Required field"></span>
                  </label>
                  <div
                    {...getRootProps()}
                    className={`mt-1 flex items-center justify-center border-2 border-dashed rounded-md h-32 cursor-pointer ${
                      isDragActive ? "border-blue-500" : "border-gray-300"
                    }`}
                  >
                    {/* <input accept="image/png,image/jpeg" {...getInputProps()} /> */}
                    <input {...getInputProps()} />
                    {formData.artwork ? (
                      <p className="text-sm text-green-500">
                        File: {formData.artwork.name}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">
                        {/* <FontAwesomeIcon icon={faUpload} size="3x" /> */}
                        Drag & drop an image here, or click to select one
                      </p>
                    )}
                  </div>
                  {errors.artwork && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.artwork[0]}
                    </p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-5 shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Submit{" "}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </>
      )}

      {isUploading && (
        <Uploading message="Your album is currently being created" />
      )}
    </div>
  );
};

export default AlbumForm;
