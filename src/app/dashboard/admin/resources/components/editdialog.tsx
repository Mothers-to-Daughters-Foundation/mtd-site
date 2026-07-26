"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateResource } from "../actions";
import { Resource } from "@/lib/models/resources";

interface Props {
  resource: Resource;
}

export default function EditDialog({ resource }: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState(resource.title);
  const [description, setDescription] = useState(
    resource.description ?? ""
  );
  const [category, setCategory] = useState(
    resource.category ?? ""
  );
  const [visibility, setVisibility] = useState<
  Resource["visibility"]
>(resource.visibility);

  const [type, setType] = useState(resource.type);

  const [message, setMessage] = useState("");

  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!title.trim()) {
      setMessage("Title is required.");
      return;
    }

    setMessage("");

    startTransition(async () => {
      try {
        await updateResource(resource.id, {
          title,
          description,
          category,
          visibility,
          type,
        });

        setOpen(false);

        router.refresh();
      } catch (err) {
        setMessage(
          err instanceof Error
            ? err.message
            : "Unable to update resource."
        );
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
      >
        ✏️ Edit
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "min(500px,95vw)",
              background: "#fff",
              padding: "24px",
              borderRadius: "12px",
            }}
          >
            <h2>Edit Resource</h2>

            <input
              type="text"
              value={title}
              placeholder="Title"
              onChange={(e) =>
                setTitle(e.target.value)
              }
              style={{
                width: "100%",
                marginTop: 16,
                marginBottom: 12,
              }}
            />

            <textarea
              value={description}
              placeholder="Description"
              onChange={(e) =>
                setDescription(e.target.value)
              }
              style={{
                width: "100%",
                minHeight: 90,
                marginBottom: 12,
              }}
            />

            <input
              type="text"
              value={category}
              placeholder="Category"
              onChange={(e) =>
                setCategory(e.target.value)
              }
              style={{
                width: "100%",
                marginBottom: 12,
              }}
            />

            <select
              value={visibility}
              onChange={(e) =>
            setVisibility(
                e.target.value as Resource["visibility"]
            )
            }
              style={{
                width: "100%",
                marginBottom: 12,
              }}
            >
              <option value="public">Public</option>
              <option value="mentor_only">
                Mentors Only
              </option>
              <option value="mentee_only">
                Mentees Only
              </option>
              <option value="private">
                Private
              </option>
            </select>

            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as Resource["type"])
              }
              style={{
                width: "100%",
                marginBottom: 20,
              }}
            >
              <option value="document">
                Document
              </option>
              <option value="video">
                Video
              </option>
              <option value="audio">
                Audio
              </option>
              <option value="link">
                Link
              </option>
              <option value="other">
                Other
              </option>
            </select>

            {message && (
              <p
                style={{
                  color: "red",
                  marginBottom: 12,
                }}
              >
                {message}
              </p>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={handleSave}
              >
                {isPending
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}