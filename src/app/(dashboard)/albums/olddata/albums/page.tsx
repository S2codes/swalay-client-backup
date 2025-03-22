"use client";
import React, { useContext, useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { apiGet } from "@/helpers/axiosRequest";
import { OldAlbumsDataTable } from "./components/oldAlbumsDataTable";
import UserContext from "@/context/userContext";

const page = () => {
  const context = useContext(UserContext);

  const lableName = context?.user?.lable;

  console.log("lableName old data :: ");
  console.log(lableName);
  

  const [albumsData, setAlbumsData] = useState([]);

  const fetchData = async () => {
    console.log("call");
    
    try {
      const response = await apiGet(`/api/olddata/get?labelName=${lableName}`);
      console.log("dsads");
      console.log(response);
      
      setAlbumsData(response.data);
    } catch (error: any) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (lableName) {
      fetchData();
    }
  }, [lableName]);

  return (
    <div className="w-full h-dvh p-6 bg-white rounded-sm">
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
            <BreadcrumbPage className="capitalize ">Old Albums</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {albumsData && <OldAlbumsDataTable data={albumsData} />}
    </div>
  );
};

export default page;



