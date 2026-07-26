"use client";

import { useState, useTransition } from "react";
import { uploadResource } from "../actions";
import styles from "../page.module.css";

export default function UploadDialog() {
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [type, setType] = useState("document");
  const [file, setFile] = useState<File | null>(null);

  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setVisibility("public");
    setType("document");
    setFile(null);
    setMessage("");
  };

  const handleClose = () => {
    resetForm();
    setOpen(false);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setMessage("Please enter a title.");
      return;
    }

    if (!file) {
      setMessage("Please choose a file.");
      return;
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("visibility", visibility);
    formData.append("type", type);
    formData.append("file", file);

    setMessage("");

    startTransition(async () => {
      try {
        await uploadResource(formData);

        setMessage("✅ Resource uploaded successfully.");

        setTimeout(() => {
          handleClose();
          window.location.reload();
        }, 1000);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to upload resource."
        );
      }
    });
  };

  return (
    <>
      <button
        className={styles.uploadButton}
        onClick={() => setOpen(true)}
      >
        + Upload Resource
      </button>

      {open && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2>Upload Resource</h2>

            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />

            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="public">Public</option>
              <option value="mentor_only">Mentors Only</option>
              <option value="mentee_only">Mentees Only</option>
              <option value="private">Private</option>
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="link">Link</option>
              <option value="other">Other</option>
            </select>

            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />

            {message && (
              <p className={styles.message}>{message}</p>
            )}

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
              >
                {isPending ? "Uploading..." : "Upload Resource"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}