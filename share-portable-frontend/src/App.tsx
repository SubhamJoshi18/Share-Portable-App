import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";

const App = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [isMultiple, setIsMultiple] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    multiple: boolean
  ) => {
    if (event.target.files) {
      setSelectedFiles(event.target.files);
      setIsMultiple(multiple);
      setUploaded(false);
      setQrCode(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles) return;

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("file", selectedFiles[i]);
    }

    setUploading(true);
    setUploaded(false);
    setQrCode(null);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/upload-file",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const urlId = response.data.data.urlId;
      setUploaded(true);

      await new Promise((resolve) => setTimeout(resolve, 10000));

      await fetchQRCode(urlId);
    } catch (error) {
      setError("Upload failed, please try again.");
      console.error("Upload failed:", error);
    }

    setUploading(false);
  };

  const handleMultiFileUpload = async () => {
    if (!selectedFiles) return;

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("files[]", selectedFiles[i]);
    }

    setUploading(true);
    setUploaded(false);
    setQrCode(null);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/upload-file",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const urlId = response.data.data.urlId;
      setUploaded(true);

      setTimeout(() => fetchQRCode(urlId), 5000);
    } catch (error) {
      setError("Upload failed, please try again.");
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const fetchQRCode = async (urlId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/get-qr-code/${urlId}`
      );
      setQrCode(response.data);
    } catch (error) {
      setError("Failed to fetch QR code. Please try again.");
      console.error("QR Code fetch failed:", error);
    }
  };

  return (
    <Container
      component={motion.div}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      maxWidth="sm"
      sx={{
        textAlign: "center",
        mt: 5,
        p: 3,
        bgcolor: "#fff",
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Upload Files
      </Typography>

      <input
        type="file"
        onChange={(e) => handleFileChange(e, false)}
        style={{ display: "none" }}
        id="single-file-upload"
      />
      <label htmlFor="single-file-upload">
        <Button component="span" variant="contained" sx={{ mb: 2, mr: 1 }}>
          Upload Single File
        </Button>
      </label>

      <input
        type="file"
        multiple
        onChange={(e) => handleFileChange(e, true)}
        style={{ display: "none" }}
        id="multi-file-upload"
      />
      <label htmlFor="multi-file-upload">
        <Button
          component="span"
          variant="contained"
          color="secondary"
          sx={{ mb: 2, ml: 1 }}
        >
          Upload Multiple Files
        </Button>
      </label>

      {selectedFiles && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" color="textSecondary">
            Selected {isMultiple ? "Files" : "File"}:{" "}
            {Array.from(selectedFiles)
              .map((file) => file.name)
              .join(", ")}
          </Typography>
        </Box>
      )}

      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: uploading ? 1.05 : 1 }}
        transition={{
          duration: 0.3,
          repeat: uploading ? Infinity : 0,
          repeatType: "reverse",
        }}
      >
        <Button
          onClick={handleUpload}
          variant="contained"
          color="success"
          disabled={!selectedFiles || uploading}
          sx={{ mt: 2 }}
        >
          {uploading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Upload"
          )}
        </Button>
      </motion.div>

      {uploaded && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
            File{isMultiple ? "s" : ""} uploaded successfully! 🎉
          </Typography>
        </motion.div>
      )}

      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {qrCode && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">
            Scan this QR Code to download the file:
          </Typography>
          <Box sx={{ mt: 2 }}>
            <div dangerouslySetInnerHTML={{ __html: qrCode }} />
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default App;
