"use client";

import { useTransition } from "react";
import { getDownloadUrl } from "../actions";

interface Props {
  id: string;
}

export default function DownloadButton({ id }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleDownload() {
    startTransition(async () => {
      try {
        const url = await getDownloadUrl(id);

        window.open(url, "_blank");
      } catch (err) {
        alert(
          err instanceof Error
            ? err.message
            : "Unable to download file."
        );
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isPending}
    >
      {isPending ? "Preparing..." : "⬇ Download"}
    </button>
  );
}