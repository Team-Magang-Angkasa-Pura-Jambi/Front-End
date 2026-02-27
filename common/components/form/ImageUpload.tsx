"use client";

import { toast } from "sonner";

import { UploadDropzone } from "@/lib/uploadthing";
import { useAuthStore } from "@/stores/authStore";

interface ImageUploadProps {
  value: string | null | undefined;
  onChange: (url: string) => void;
  disabled?: boolean;
  endpoint?: "profileImage";
}

export const ImageUpload = ({ value, onChange }: any) => {
  const token = useAuthStore((state) => state.token);

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4">
      <UploadDropzone
        endpoint="imageUploader"
        headers={{
          Authorization: `Bearer ${token}`,
        }}
        onClientUploadComplete={(res) => {
          onChange(res?.[0].url);
          toast.success("Upload Berhasil!");
        }}
        onUploadError={(error: Error) => {
          toast.error(`Error: ${error.message}`);
          console.error("UT Error:", error);
        }}
      />
      {value && <p className="mt-2 max-w-[150px] truncate text-xs text-green-600">{value}</p>}
    </div>
  );
};
