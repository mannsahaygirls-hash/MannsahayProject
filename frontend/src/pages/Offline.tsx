import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Offline = () => {
  const handleDownload = () => {
    const driveLink = "https://drive.google.com/drive/folders/1elbXYSRfpjLpgJ2lJQRGdA7G7vIcG70P?usp=drive_link";
    window.open(driveLink, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            MannSahay Offline  ✈️
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Your friendly companion — talk like friends, no judgment, just real
            conversations
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect with your digital buddy who talks like a real friend. Share
            your thoughts, get support, and discover activities to boost your
            mood together.
          </p>
        </div>

        {/* Offline Mode Card */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="text-6xl mb-6">📥</div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Enable Offline Mode
              </h2>
              <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                Download the offline version to use MannMitra without an internet connection.
                Perfect for when you need support anytime, anywhere.
              </p>
              <Button
                onClick={handleDownload}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                size="lg"
              >
                Download Offline Version
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Offline;