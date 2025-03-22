"use client";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ClipboardList } from "lucide-react";


// Fixed platforms array
const platforms = [
  "Spotify",
  "JioSaavn",
  "Wynk",
  "Facebook",
  "Amazon",
  "Gaana",
  "iTunes",
  "YouTubeCMS",
  "Tiktok",
  "AtlantisCRBT",
  "Jio CRBT",
  "Pandora",
  "Deezer",
  "Snap",
  "Anghami",
  "RESSO-Bytedance",
  "SoundCloud",
  "Hungama",
];

interface ContentDeliveryReportProps {
  contentTitle: string;
  approvalDate: string;
}



export default function ContentDeliverySheet({
  contentTitle,
  approvalDate,
}: ContentDeliveryReportProps) {
  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>
        
          <button className="bg-black text-white rounded-lg flex items-center gap-2 mt-4 ms-5 mb-2 btn me-2  p-3 ">
            <ClipboardList className="w-4 h-4" />
            Platfrom Report
          </button>
        </SheetTrigger>
        <SheetContent
          className="w-full sm:max-w-lg overflow-y-auto"
          id="contentDeliveryReportSheet"
        >
          <SheetHeader>
            <SheetTitle>Delivery Details</SheetTitle>
            <SheetDescription>
              Information about content delivery to multiple platforms
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">

            
            <div>
              <h3 className="text-lg font-semibold m-0">Album</h3>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                {contentTitle}
              </h4>
            </div>

            {platforms.map((platform, index) => (
              <div key={platform} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Platform
                    </h4>
                    <p className="text-sm">{platform}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Delivery Date
                    </h4>
                    <p className="text-sm">
                      {new Date() < new Date(new Date(approvalDate).setDate(new Date(approvalDate).getDate() + 1))
                        ? "Awaiting Delivery"
                        : new Date(new Date(approvalDate).setDate(new Date(approvalDate).getDate() + 1)).toLocaleString("en-GB")}
                    </p>

                  </div>
                </div>
                {index < platforms.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
