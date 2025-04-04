"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Style from "../../../../../styles/ViewAlbums.module.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiGet, apiPost } from "@/helpers/axiosRequest";
import toast from "react-hot-toast";
import ConfirmationDialog from "@/components/ConfirmationDialog";
// import { onShare } from "@/helpers/urlShare";

interface TrackListProps {
  trackId: string;
  onFetchDetails: (songName: string, url: string) => void;
}

interface ArtistDetail {
  _id: string;
  artistName: string;
}

interface TrackDetail {
  albumId: string;
  songName: string | null;
  primarySinger: ArtistDetail | null;
  singers: ArtistDetail[] | null;
  composers: ArtistDetail[] | null;
  lyricists: ArtistDetail[] | null;
  producers: ArtistDetail[] | null;
  audioFile: string | null;
  audioFileWav: string | null;
  isrc: string | null;
  duration: string | null;
  crbt: string | null;
  platformLinks: {
    SpotifyLink: string | null;
    AppleLink: string | null;
    Instagram: string | null;
    Facebook: string | null;
  } | null;
  category: string | null;
  version: string | null;
  trackType: string | null;
  trackOrderNumber: string | null;
  albumStatus: number;
}

const TrackDetails: React.FC<TrackListProps> = ({
  trackId,
  onFetchDetails,
}) => {
  const [trackDetails, setTrackDetails] = useState<TrackDetail | null>(null);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  const fetchTrackDetails = async () => {
    console.log("in track details");

    try {
      const response = await apiGet(
        `/api/track/getTrackDetails?trackId=${trackId}`
      );

      if (response.success) {

        setTrackDetails(response.data);
        const songName = response.data.songName;
        const audioUrl = `${process.env.NEXT_PUBLIC_AWS_S3_FOLDER_PATH}albums/07c1a${response.data.albumId}ba3/tracks/${response.data.audioFile}`;

        onFetchDetails(songName, audioUrl);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.log("something went wrong");
      setError("Internal server error");
    }
  };

  // useEffect(() => {
  //   fetchTrackDetails();
  // }, []);

  useEffect(() => {
    console.log("trackId changed:", trackId);
    fetchTrackDetails();
  }, [trackId]);

  const downloadRef = useRef<HTMLAnchorElement>(null);

  const handleDownload = () => {
    if (downloadRef.current) {
      downloadRef.current.click();
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success("URL copied to clipboard!");
      })
      .catch((err) => {
        // console.error('Failed to copy URL: ', err);
        toast.error("Failed to copy URL");
      });
  };

  const onDelete = async () => {
    setIsDialogOpen(true);
  };

  const handleContinue = async () => {
    console.log("Action continued");

    console.log(trackId);

    try {
      const response = await apiPost("/api/track/deleteTrack", { trackId });

      if (response.success) {
        toast.success("Success! Your album is deleted");
        window.location.reload();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log("error in api", error);
      toast.error("Internal server error");
    }
  };

  return (
    <div className={`p-1 ${Style.trackDetails}`}>
      <div className={Style.trackDetailsTop}>
        <h5 className={`mt-3 ${Style.subheading}`}> Track Details</h5>

        <div className={Style.trackDetailsIconGroup}>
          {trackDetails?.audioFile && (
            <i
              className="bi bi-link-45deg"
              onClick={() =>
                handleCopyUrl(
                  `${process.env.NEXT_PUBLIC_AWS_S3_FOLDER_PATH}albums/07c1a${trackDetails.albumId}ba3/tracks/${trackDetails.audioFile}`
                )
              }
            ></i>
          )}

          {trackDetails?.audioFile && (
            <div onClick={handleDownload}>
              {/* Download icon */}
              <i className="bi bi-download"></i>

              {/* Hidden anchor tag to handle download */}
              <a
                ref={downloadRef}
                href={`${process.env.NEXT_PUBLIC_AWS_S3_FOLDER_PATH}albums/07c1a${trackDetails.albumId}ba3/tracks/${trackDetails.audioFile}`}
                download={trackDetails.audioFile as string}
                style={{ display: "none" }}
                target="_blank"
                  rel="noopener noreferrer"
              >
                Download
              </a>

              {/* Hidden audio tag (if you still need to keep it) */}
              <audio style={{ display: "none" }} controls>
                <source
                  src={`${process.env.NEXT_PUBLIC_AWS_S3_FOLDER_PATH}albums/07c1a${trackDetails.albumId}ba3/tracks/${trackDetails.audioFile}`}
                  type="audio/mpeg"
                />
              </audio>
            </div>
          )}

          {trackDetails &&
            trackDetails.albumStatus !== 4 &&
            trackDetails.albumStatus !== 1 &&
            trackDetails.albumStatus !== 2 && (
              <div>
                <Link href={`/albums/edittrack/${btoa(trackId)}`}>
                  <i className="bi bi-pencil-square" title="Edit track"></i>
                </Link>
                <button onClick={onDelete}>
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            )}
        </div>
      </div>
      <div className={`mt-2 ${Style.currentTrackDetails} `}>
        {/* <p className={`mb-3 ${Style.trackInfoTrackName}`}><span className={Style.trackNameLable}>Track Name: </span> Lost in Mountain</p> */}
        <p className={`mb-3 ${Style.trackInfoTrackName}`}>
          <i className={`bi bi-music-note-list ${Style.trackNameIcon}`}></i>
          {trackDetails && trackDetails?.songName}
        </p>

        {trackDetails && (
          <div className="flex items-center justify-start">
            <Link
              className="px-3 py-2 bg-cyan-600 text-white rounded my-3"
              href={`/albums/tracks/addLyrics/${btoa(
                trackId ?? ""
              )}?trackname=${encodeURIComponent(
                trackDetails?.songName ?? ""
              )}&trackurl=${encodeURIComponent(
                trackDetails?.audioFile
                  ? `${process.env.NEXT_PUBLIC_AWS_S3_FOLDER_PATH}albums/07c1a${trackDetails?.albumId}ba3/tracks/${trackDetails.audioFile}`
                  : ""
              )}`}
            >
              Add Lyrics <i className="bi bi-pen-fill"></i>
            </Link>          
          </div>
        )}

        <div className="mt-3">
          <Tabs defaultValue="track" className="w-100">
            <TabsList>
              <TabsTrigger value="track">Track Info</TabsTrigger>
              <TabsTrigger value="publishiling">Publishing Info</TabsTrigger>
            </TabsList>
            <TabsContent value="track">
              <div className={`mt-2  ${Style.trackInfoListContainer}`}>
                <ul className="p-3">
                  <li className={`mb-2 ${Style.albumInfoItem}`}>
                    <span className="text-sm font-medium text-gray-900 truncate dark:text-white">
                      ISRC:
                    </span>{" "}
                    {trackDetails && trackDetails.isrc}
                  </li>
                  <li className={`mb-2 ${Style.albumInfoItem}`}>
                    <span className="text-sm font-medium text-gray-900 truncate dark:text-white">
                      Category:
                    </span>{" "}
                    {trackDetails && trackDetails.category}
                  </li>
                  <li className={`mb-2 ${Style.albumInfoItem}`}>
                    <span className="text-sm font-medium text-gray-900 truncate dark:text-white">
                      TrackType:
                    </span>{" "}
                    {trackDetails && trackDetails.trackType}
                  </li>
                  <li className={`mb-2 ${Style.albumInfoItem}`}>
                    <span className="text-sm font-medium text-gray-900 truncate dark:text-white">
                      Version:
                    </span>{" "}
                    {trackDetails && trackDetails.version}
                  </li>

                  <li className={`mb-2 ${Style.albumInfoItem}`}>
                    <span className="text-sm font-medium text-gray-900 truncate dark:text-white">
                      Caller Tune:
                    </span>{" "}
                    {trackDetails && trackDetails.crbt}
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="publishiling">
              <div className={`mt-2  ${Style.trackInfoListContainer}`}>
                <ul className="p-3">
                  <li className={`mb-2 ${Style.albumInfoItem}`}>
                   
                    {trackDetails?.primarySinger && (
                      <Link href={`/artist/${trackDetails.primarySinger._id}`}>
                        {trackDetails.primarySinger.artistName}
                      </Link>
                    )}
                  </li>
                  <li className={`mb-2 ${Style.albumInfoItem}`}>
                    <span className="text-sm font-medium text-gray-900 truncate dark:text-white">
                      Singer:{" "}
                    </span>
                    {/* {trackDetails?.singers?.map((singer) => (
                      <span key={singer._id}>
                        <Link href={`/artist/${singer._id}`}>
                          {singer.artistName}
                        </Link>
                      </span>
                    ))} */}

                    {trackDetails?.singers?.map((singer, index) => (
                      <span key={singer._id}>
                        <Link href={`/artist/${singer._id}`}>
                          {singer.artistName}
                        </Link>
                        {index < (trackDetails.singers?.length ?? 0) - 1 &&
                          ", "}
                      </span>
                    ))}
                  </li>
                  <li className={`mb-2 ${Style.albumInfoItem}`}>
                    <span className="text-sm font-medium text-gray-900 truncate dark:text-white">
                      Lyricist:
                    </span>{" "}
                    {trackDetails?.lyricists?.map((lyricist, index) => (
                      <span key={lyricist._id}>
                        <Link href={`/artist/${lyricist._id}`}>
                          {lyricist.artistName}
                        </Link>
                        {index < (trackDetails.lyricists?.length ?? 0) - 1 &&
                          ", "}
                      </span>
                    ))}
                  </li>
                  <li className={`mb-2 ${Style.albumInfoItem}`}>
                    <span className="text-sm font-medium text-gray-900 truncate dark:text-white">
                      Composer:
                    </span>{" "}
                    {trackDetails?.composers?.map((composer) => (
                      <span key={composer._id}>
                        <Link href={`/artist/${composer._id}`}>
                          {composer.artistName}
                        </Link>
                      </span>
                    ))}
                  </li>
                  <li className={`mb-2 ${Style.albumInfoItem}`}>
                    <span className="text-sm font-medium text-gray-900 truncate dark:text-white">
                      Music Producer:
                    </span>{" "}
                    {trackDetails?.producers?.map((producer) => (
                      <span key={producer._id}>
                        <Link href={`/artist/${producer._id}`}>
                          {producer.artistName}
                        </Link>
                      </span>
                    ))}
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* <div className={`mt-4 flex  ${Style.socialGroup}`}> */}

        {/* <div className={`mt-4 flex `}>
          <Link href={"/"}>
            <Image
              src={"/images/image.png"}
              width={50}
              height={50}
              alt="music platfrom"
            />
          </Link>
          <Link href={"/"} className="ms-3">
            <Image
              src={"/images/spotify.png"}
              width={50}
              height={50}
              alt="music platfrom"
            />
          </Link>
        </div> */}

        <ConfirmationDialog
          confrimationText="Delete"
          show={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onContinue={handleContinue}
          title="Are You Sure ?"
          description="Once you delete this track, you will no longer be able to retrieve the tracks associated with it."
        />
      </div>
    </div>
  );
};

export default TrackDetails;
