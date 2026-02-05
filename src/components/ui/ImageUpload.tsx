import { FileImage, Upload } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "../../lib/utils";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
}

export function ImageUpload({
  onImageSelect,
  selectedImage,
}: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onImageSelect(acceptedFiles[0]);
      }
    },
    [onImageSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors h-64 flex flex-col items-center justify-center",
        isDragActive
          ? "border-primary bg-primary/10"
          : "border-border hover:border-primary/50 hover:bg-muted/50",
        selectedImage ? "border-solid border-primary" : "",
      )}
    >
      <input {...getInputProps()} />
      {selectedImage ? (
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full max-w-sm aspect-video rounded-md overflow-hidden bg-background">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <FileImage size={16} />
            {selectedImage.name}
          </p>
          <p className="text-xs text-muted-foreground">(Click to replace)</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-muted rounded-full">
            <Upload size={32} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">
              Drop an image here, or click to upload
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Supports PNG, JPG, WEBP (Max 4MB recommended)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
