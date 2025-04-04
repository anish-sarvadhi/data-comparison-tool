"use client"

import type React from "react"

import { useState } from "react"
import { FileIcon, UploadIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface FileUploaderProps {
  title: string
  description: string
  onFileUpload: (file: File) => void
  fileUploaded: boolean
}

export function FileUploader({ title, description, onFileUpload, fileUploaded }: FileUploaderProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      onFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.name.endsWith(".xlsx")) {
      setFileName(file.name)
      onFileUpload(file)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {fileUploaded ? (
          <div className="flex items-center p-4 bg-green-50 rounded-md">
            <FileIcon className="h-6 w-6 text-green-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-800">File uploaded successfully</p>
              {fileName && <p className="text-xs text-green-600">{fileName}</p>}
            </div>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-md p-8 text-center ${
              isDragging ? "border-primary bg-primary/5" : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadIcon className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">Drag and drop your Excel file here, or click to browse</p>
            <input
              type="file"
              id={`file-upload-${title}`}
              className="sr-only"
              accept=".xlsx"
              onChange={handleFileChange}
            />
            <Button asChild variant="outline" size="sm">
              <label htmlFor={`file-upload-${title}`}>Browse Files</label>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

