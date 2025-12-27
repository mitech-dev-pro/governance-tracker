"use client";

import React from "react";
import ImageUpload from "../components/ImageUpload";
import FileManager from "../components/FileManager";

export default function TestUploadPage() {
  const [imageUrl, setImageUrl] = React.useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Image Upload Testing
          </h1>
          <p className="text-gray-600">
            Test the image upload functionality for user profile pictures
          </p>
        </div>

        {/* ImageUpload Component Test */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">
            ImageUpload Component Test
          </h2>
          <ImageUpload
            currentImage={imageUrl}
            onImageChange={(url) => {
              console.log("Image changed:", url);
              setImageUrl(url);
            }}
            onImageRemove={() => {
              console.log("Image removed");
              setImageUrl("");
            }}
            size="lg"
          />

          {imageUrl && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-green-800 text-sm">
                <strong>Success!</strong> Image uploaded:{" "}
                <code>{imageUrl}</code>
              </p>
            </div>
          )}
        </div>

        {/* File Manager */}
        <FileManager />

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How to Test
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Use the ImageUpload component above to upload an image</li>
            <li>Check that the image appears in the preview</li>
            <li>
              Verify the file was saved to <code>/public/uploads/avatars/</code>
            </li>
            <li>Test drag and drop functionality</li>
            <li>Test file size and type validation</li>
            <li>Use the File Manager to upload additional test files</li>
          </ol>

          <div className="mt-4 p-3 bg-white rounded border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">API Endpoints:</h4>
            <ul className="text-sm space-y-1 text-blue-700">
              <li>
                <code>POST /api/upload</code> - Upload files
              </li>
              <li>
                <code>GET /uploads/avatars/[filename]</code> - Serve uploaded
                images
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
