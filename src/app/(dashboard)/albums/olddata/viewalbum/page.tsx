"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Play,
  Pause,
  Music,
  Calendar,
  Clock,
  Info,
  Music2,
  Youtube,
  ShoppingCart,
  ExternalLink,
} from "lucide-react";

// Define the types for the API response
type Image = {
  height: number;
  width: number;
  url: string;
};

type Service = {
  id: string;
  link: string;
};

type Services = {
  [key: string]: Service;
};

type Artist = {
  type: string;
  name: string;
  services: Services;
};

type Album = {
  type: string;
  name: string;
  totalTracks: number;
  releaseDate: string;
  upc: string;
  image: Image;
  label: string;
  copyright: string;
  services: Services;
};

type Track = {
  type: string;
  name: string;
  duration: number;
  isrc: string;
  isExplicit: boolean;
  previewUrl: string;
  releaseDate: string;
  image: Image;
  label: string;
  copyright: string;
  services: Services;
  artists: Artist[];
  albums: Album[];
};

type ApiResponse = {
  result: Track;
};

const Page = () => {
  const searchParams = useSearchParams();
  const isrc = searchParams.get("isrc");

  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState("track");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchAlbumDetails = async () => {
    try {
      const response = await axios.get<ApiResponse>(
        `https://api.musicfetch.io/isrc?isrc=${isrc}`,
        {
          headers: {
            "x-token": process.env.NEXT_PUBLIC_MUSICFETCH_X_TOKEN || "",
          },
        }
      );
      if (response.data.result) {
        setTrack(response.data.result);
      }
    } catch (error) {
      toast.error("Invalid ISRC");
      console.log(error);
    }
  };

  useEffect(() => {
    if (isrc) {
      fetchAlbumDetails();
    }
  }, [isrc]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
    }
  }, []);

  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case "spotify":
        return <Music2 className="h-5 w-5" />;
      case "youtube":
        return <Youtube className="h-5 w-5" />;
      case "amazonMusic":
      case "jioSaavn":
      case "anghami":
      case "trebel":
        return <Music className="h-5 w-5" />;
      case "amazon":
        return <ShoppingCart className="h-5 w-5" />;
      default:
        return <ExternalLink className="h-5 w-5" />;
    }
  };

  const formatServiceName = (service: string) => {
    switch (service) {
      case "amazonMusic":
        return "Amazon Music";
      case "jioSaavn":
        return "JioSaavn";
      default:
        return service.charAt(0).toUpperCase() + service.slice(1);
    }
  };

  const renderServiceLinks = () => {
    if (!track) return null;

    let services: Services;

    if (activeTab === "track") {
      services = track.services;
    } else if (activeTab === "album") {
      services = track.albums[0].services;
    } else {
      services = track.artists[0].services;
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(services).map(([service, { link }]) => (
          <a
            key={service}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline"
          >
            <button className="w-full h-14 flex items-center justify-start gap-3 px-4 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
              <div className="bg-gray-100 p-2 rounded-md">
                {getServiceIcon(service)}
              </div>
              <span className="text-gray-800">
                {formatServiceName(service)}
              </span>
            </button>
          </a>
        ))}
      </div>
    );
  };

  if (!track) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full  p-6 bg-white rounded-sm">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Albums</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="capitalize">View Album</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="bg-gradient-to-b from-gray-50 to-white text-gray-800 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-3">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
              Track Details
            </h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm col-span-1 lg:col-span-2 overflow-hidden">
              <div className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="relative min-w-40 h-40 rounded-md overflow-hidden shadow-md">
                  <img
                    src={track.image.url || "/placeholder.svg"}
                    alt={track.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mb-2">
                      {track.type.toUpperCase()}
                    </span>
                    {track.isExplicit && (
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 ml-2">
                        EXPLICIT
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {track.name}
                  </h2>
                  <p className="text-xl text-gray-700">
                    {track.artists[0].name}
                  </p>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(track.releaseDate)}</span>
                    <span className="mx-1">•</span>
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(track.duration)}</span>
                  </div>
                  <div className="flex items-center mt-4">
                    <button
                      onClick={togglePlay}
                      className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="mr-2 h-4 w-4" />
                      ) : (
                        <Play className="mr-2 h-4 w-4" />
                      )}
                      {isPlaying ? "Pause Preview" : "Play Preview"}
                    </button>
                    <audio ref={audioRef} src={track.previewUrl} />
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                {isPlaying && (
                  <div className="mt-4">
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-100"
                        style={{
                          width: `${
                            (currentTime / (track.duration / 1000)) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{Math.floor(currentTime)}</span>
                      <span>{formatDuration(track.duration)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
                  <Info className="mr-2 h-5 w-5" />
                  Track Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">ISRC</p>
                    <p className="font-mono text-gray-800">{track.isrc}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Label</p>
                    <p className="text-gray-800">{track.label}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Copyright</p>
                    <p className="text-sm text-gray-800">{track.copyright}</p>
                  </div>
                  <hr className="border-gray-200" />
                  <div>
                    <p className="text-sm text-gray-500">Album</p>
                    <div className="flex items-center mt-2">
                      <div className="w-10 h-10 mr-3">
                        <img
                          src={track.albums[0].image.url || "/placeholder.svg"}
                          alt={track.albums[0].name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {track.albums[0].name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {track.albums[0].totalTracks} track
                          {track.albums[0].totalTracks !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm col-span-1 lg:col-span-3">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-1 text-gray-900">
                  Available On
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Listen to this track on your favorite platform
                </p>

                <div className="border-b border-gray-200 mb-4">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setActiveTab("track")}
                      className={`pb-2 px-1 text-sm font-medium ${
                        activeTab === "track"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Track
                    </button>
                    <button
                      onClick={() => setActiveTab("album")}
                      className={`pb-2 px-1 text-sm font-medium ${
                        activeTab === "album"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Album
                    </button>
                    <button
                      onClick={() => setActiveTab("artist")}
                      className={`pb-2 px-1 text-sm font-medium ${
                        activeTab === "artist"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Artist
                    </button>
                  </div>
                </div>

                <div className="mt-4">{renderServiceLinks()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
