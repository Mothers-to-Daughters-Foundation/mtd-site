"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteResource } from "../actions";

interface Props {
  id: string;
}

export default function DeleteButton({ id }: Props) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resource?"
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteResource(id);

        router.refresh();
      } catch (err) {
        alert(
          err instanceof Error
            ? err.message
            : "Unable to delete resource."
        );
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}