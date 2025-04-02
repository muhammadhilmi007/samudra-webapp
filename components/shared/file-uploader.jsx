"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UploadCloud, X, Loader2, FileIcon, ImageIcon } from 'lucide-react'
import Image from 'next/image'

const FileUploader = ({
  accept = 'image/*',
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB
  minSize = 0,
  disabled = false,
  onDrop,
  preview = null,
  loading = false,
  label = 'Upload File',
  icon = <UploadCloud className="h-4 w-4 mr-2" />,
  description = 'Drag & drop file here, or click to select'
}) => {
  const [error, setError] = useState(null)
  
  const onDropAccepted = useCallback((acceptedFiles) => {
    setError(null)
    if (onDrop) {
      onDrop(acceptedFiles)
    }
  }, [onDrop])
  
  const onDropRejected = useCallback((rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      const { errors } = rejectedFiles[0]
      if (errors && errors.length > 0) {
        const error = errors[0]
        if (error.code === 'file-too-large') {
          setError(`File terlalu besar. Maksimal ukuran file adalah ${maxSize / 1024 / 1024} MB.`)
        } else if (error.code === 'file-invalid-type') {
          setError(`Tipe file tidak didukung. Silakan unggah file dengan format yang benar.`)
        } else if (error.code === 'too-many-files') {
          setError(`Terlalu banyak file. Silakan unggah maksimal ${maxFiles} file.`)
        } else {
          setError(`Error: ${error.message}`)
        }
      }
    }
  }, [maxFiles, maxSize])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted,
    onDropRejected,
    accept: accept ? accept.split(',').reduce((acc, item) => {
      acc[item.trim()] = []
      return acc
    }, {}) : undefined,
    maxFiles,
    maxSize,
    minSize,
    disabled: disabled || loading
  })
  
  const hasPreview = !!preview
  
  const getFileIconByType = () => {
    if (accept.includes('image')) {
      return <ImageIcon className="h-10 w-10 text-muted-foreground" />
    } else {
      return <FileIcon className="h-10 w-10 text-muted-foreground" />
    }
  }
  
  return (
    <div className="space-y-2">
      {hasPreview ? (
        <div className="relative">
          <Card className="overflow-hidden">
            {accept.includes('image') ? (
              <div className="relative aspect-video w-full bg-muted">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-md"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center p-4 h-32 bg-muted">
                <FileIcon className="h-10 w-10 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">
                  File terunggah
                </span>
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Button
                variant="destructive"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={(e) => {
                  e.stopPropagation()
                  onDrop(null)
                }}
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary/50 bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5'
          } ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            {loading ? (
              <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
            ) : (
              getFileIconByType()
            )}
            <div className="space-y-1">
              <p className="font-medium text-sm">
                {loading ? 'Mengunggah...' : label}
              </p>
              <p className="text-xs text-muted-foreground">
                {loading ? 'Mohon tunggu' : description}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
      
      {hasPreview && !loading && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          {...getRootProps()}
        >
          {icon}
          Ganti File
        </Button>
      )}
    </div>
  )
}

export default FileUploader