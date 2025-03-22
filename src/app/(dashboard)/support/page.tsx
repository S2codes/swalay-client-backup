"use client";

import React, { useContext, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserContext from "@/context/userContext";
import { apiPost } from "@/helpers/axiosRequest";
import toast from "react-hot-toast";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  labelId?: string;
}

export default function Component() {
  const context = useContext(UserContext);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
    labelId: "",
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (context?.user) {
      setFormData({
        name: context.user.username || "",
        email: context.user.email || "",
        subject: "",
        message: "",
        labelId: context.user._id || "",
      });
    }
  }, [context]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.subject || !formData.message) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await apiPost("/api/support/addSupport", formData);

      if (response.success) {
        toast.success("Thank You! We will be in touch with you shortly.");
        setFormData({ ...formData, subject: "", message: "" });
      } else {
        toast.error(response.message);
        setError("Failed to send the message. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="w-full min-h-[80dvh] p-6 bg-white rounded-sm">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold">Support Desk</h1>
        <p className="text-muted-foreground">
          Have a question or need assistance? Fill out the form below and our
          support team will get back to you as soon as possible.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control"
                    required
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    required
                    readOnly
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  type="text"
                  placeholder="Briefly describe your issue"
                  value={formData.subject}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  placeholder="Provide more details about your request"
                  value={formData.message}
                  onChange={handleChange}
                  className="min-h-[150px] form-control"
                  required
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <Button type="submit" className="w-full btn btn-primary">
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div>
              <h3 className="font-semibold">Phone</h3>
              <p>
                <a>011 69268163 </a>
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Email</h3>
              <p>
                <a href="mailto:swalay.care@talantoncore.in">swalay.care@talantoncore.in</a>
              </p>
            </div>
            <div>
              <h3 className="font-semibold">WhatsApp</h3>
              <p>
                <a href="#">011 69268163 </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
