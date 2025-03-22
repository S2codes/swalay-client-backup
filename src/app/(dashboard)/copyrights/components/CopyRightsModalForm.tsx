"use client";

import { Modal } from "@/components/Modal";
import UserContext from "@/context/userContext";
import { apiPost } from "@/helpers/axiosRequest";
import React, { useContext, useState } from "react";
import toast from "react-hot-toast";

const CopyRightsModalForm = ({
  isVisible,
  onClose,
}: {
  isVisible: boolean;
  onClose: () => void;
}) => {
  const context = useContext(UserContext);
  const labelId = context?.user?._id;

  const [formData, setFormData] = useState({
    youtubeUrl: "",
  });

  const handleSave = async () => {

    if (!formData.youtubeUrl && formData.youtubeUrl === "") {
      toast.error("Please paste your youtube link");
      return;
    }

    toast.loading("Loading...");

    const response = await apiPost("/api/copyright/addCopyright", {
      labelId,
      link: formData.youtubeUrl,
    });
    
    console.log("add copyright response");
    console.log(response);

    if (response.success) {
      onClose();
      toast.success("New Copyright added");
      setFormData({ youtubeUrl: "" });
      window.location.reload();
    } else {
      onClose();
      toast.success("Internal server error");
    }

  };

  return (
    <Modal
      isVisible={isVisible}
      triggerLabel="Submit"
      title="New Copyright"
      onSave={handleSave}
      onClose={onClose}
    >
      <div>
        <label className="form-label" htmlFor="youtubeUrl">
          YouTube URL
        </label>
        <input
          id="youtubeUrl"
          type="text"
          name="youtubeUrl"
          placeholder="Paste your YouTube URL here"
          value={formData.youtubeUrl}
          onChange={(e) =>
            setFormData({ ...formData, youtubeUrl: e.target.value })
          }
          onBlur={(e) => {
            const value = e.target.value;
            const youtubeRegex =
              /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

            if (!youtubeRegex.test(value) && value !== "") {
              toast.error("Please enter a valid YouTube URL");
              // Optionally reset the input if invalid
              setFormData({ ...formData, youtubeUrl: "" });
            }
          }}
          className="form-control"
        />
      </div>
    </Modal>
  );
};

export default CopyRightsModalForm;
