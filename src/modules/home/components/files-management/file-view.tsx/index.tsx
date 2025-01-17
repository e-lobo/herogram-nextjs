"use client";

import { useState, useEffect } from "react";
import { FileResponse, ShareStats } from "@/types/api";
import { toast } from "sonner";
import {
  FileIcon,
  ImageIcon,
  // TrashIcon,
  DownloadIcon,
  UploadIcon,
  LinkIcon,
} from "lucide-react";
import FileService from "@/services/FileService";
import { config } from "@/config";
import { getToken } from "@/utils/auth";

export default function FileView() {
  const [files, setFiles] = useState<FileResponse[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [shareStats, setShareStats] = useState<Record<string, ShareStats[]>>(
    {}
  );

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const data = await FileService.fetchFiles();
      setFiles(data.data);
    } catch (error) {
      console.error("Failed to fetch files:", error);
      toast.error("Failed to fetch files");
    }
  };

  const handleCreateShareLink = async (fileId: string) => {
    try {
      const data = await FileService.createShareLink(fileId);
      toast.success("Share link created successfully");

      // Fetch and update share stats
      fetchShareStats(fileId);

      return data.data.url;
    } catch (error) {
      console.error("Failed to create share link:", error);
      toast.error("Failed to create share link");
    }
  };

  // const handleDelete = async (fileId: string) => {
  //   try {
  //     await FileService.deleteFile(fileId);
  //     toast.success("File deleted successfully");
  //     fetchFiles();
  //   } catch (error) {
  //     console.error("Delete failed:", error);
  //     // console.error("Delete failed:", error);
  //     // toast.error("Delete failed");
  //   }
  // };

  const fetchShareStats = async (fileId: string) => {
    try {
      const data = await FileService.getShareStats(fileId);
      setShareStats((prevStats) => ({
        ...prevStats,
        [fileId]: data.data,
      }));
    } catch (error) {
      console.error("Failed to fetch share stats:", error);
      toast.error("Failed to fetch share stats");
    }
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log("Link copied to clipboard:", text);
      toast.success("Link copied to clipboard");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy link");
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="w-6 h-6" />;
    return <FileIcon className="w-6 h-6" />;
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files?.length) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(FileService.uploadFile);
      await Promise.all(uploadPromises);

      toast.success("Files uploaded successfully");
      fetchFiles();
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const token = getToken();
      const response = await fetch(`${config.apiUrl}/files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed");
    }
  };

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = e.dataTransfer.files;
        handleFileUpload(droppedFiles);
      }}
    >
      {/* Upload Section */}
      <div
        className={`mb-8 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          type="file"
          id="fileUpload"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
          multiple
        />
        <label
          htmlFor="fileUpload"
          className="flex flex-col items-center cursor-pointer"
        >
          <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
          <span className="text-lg font-medium mb-2">
            {isUploading ? "Uploading..." : "Drop files here"}
          </span>
          <span className="text-sm text-gray-500">
            or click to select files
          </span>
        </label>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="p-4 border rounded-lg hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              {getFileIcon(file.mimeType)}
              <span className="font-medium truncate">{file.originalName}</span>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <p>{new Date(file.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => handleDownload(file.id, file.originalName)}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
              >
                <DownloadIcon className="w-4 h-4" />
              </button>
               {/*
              <button
                disabled
                onClick={() => handleDelete(file.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
              */}
              <button
                onClick={async () => {
                  const link = await handleCreateShareLink(file.id);
                  if (link) handleCopyToClipboard(link);
                }}
                className="p-2 text-green-500 hover:bg-green-50 rounded-md transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Share Stats */}
            {shareStats[file.id]?.map((stat) => (
              <div
                key={stat.id}
                className="bg-gray-50 p-2 rounded-md text-sm text-gray-700"
              >
                <p>Total Views: {stat.statistics.totalViews}</p>
                <p>Unique Views: {stat.statistics.uniqueViews}</p>
                <p>Last Viewed: {stat.statistics.lastViewedAt || "Never"}</p>
                <p>URL: {stat.url}</p>
                <p>
                  Expiration:{" "}
                  {stat.statistics.isExpired
                    ? "Expired"
                    : new Date(
                        stat.expiresAt
                          ? stat.expiresAt
                          : new Date().toISOString()
                      ).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
