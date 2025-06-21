// MedicationTracker.tsx
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Image, Camera, Clock } from "lucide-react";
import { format } from "date-fns";
import api from "@/lib/api"; // your axios instance

interface MedicationTrackerProps {
  date: string;
  isTaken: boolean;
  isToday: boolean;
  medicationId: number;
  onTaken: () => void; // callback to update taken status in parent
}

const MedicationTracker = ({ date, isTaken, isToday, medicationId, onTaken }: MedicationTrackerProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMarkTaken = async () => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("date", date);
    if (selectedImage) formData.append("proof", selectedImage);

    try {
      await api.post(`/api/medications/${medicationId}/taken`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSelectedImage(null);
      setImagePreview(null);
      onTaken(); // update in PatientDashboard
    } catch (error) {
      console.error("Error uploading proof:", error);
    }
  };

  if (isTaken) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8 bg-green-50 rounded-xl border-2 border-green-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Medication Completed!
            </h3>
            <p className="text-green-600">
              You've taken your medication for {format(new Date(date), "MMMM d, yyyy")}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium">1</span>
            </div>
            <div>
              <h4 className="font-medium">Daily Medication Set</h4>
              <p className="text-sm text-muted-foreground">Complete set of daily tablets</p>
            </div>
          </div>
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            8:00 AM
          </Badge>
        </CardContent>
      </Card>

      <Card className="border-dashed border-2 border-border/50">
        <CardContent className="p-6 text-center">
          <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">Add Proof Photo (Optional)</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            ref={fileInputRef}
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="mb-4">
            <Camera className="w-4 h-4 mr-2" />
            {selectedImage ? "Change Photo" : "Take Photo"}
          </Button>
          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Medication proof"
                className="max-w-full h-32 object-cover rounded-lg mx-auto border"
              />
              <p className="text-sm text-muted-foreground mt-2">{selectedImage?.name}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={handleMarkTaken}
        className="w-full py-4 text-lg bg-green-600 hover:bg-green-700 text-white"
        disabled={!isToday}
      >
        <Check className="w-5 h-5 mr-2" />
        {isToday ? "Mark as Taken" : "Cannot mark future dates"}
      </Button>

      {!isToday && (
        <p className="text-center text-sm text-muted-foreground">
          You can only mark today's medication as taken
        </p>
      )}
    </div>
  );
};

export default MedicationTracker;
