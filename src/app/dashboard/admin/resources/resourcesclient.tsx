"use client";

import { useMemo, useState } from "react";
import { Resource } from "@/lib/models/resources";
import ResourceCard from "./components/resourcecard";
import styles from "./page.module.css";

interface Props {
  resources: Resource[];
}

export default function ResourcesClient({ resources }: Props) {
  const [search, setSearch] = useState("");

  const filteredResources = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return resources;

    return resources.filter((resource) => {
      return (
        resource.title.toLowerCase().includes(query) ||
        (resource.description ?? "")
          .toLowerCase()
          .includes(query) ||
        (resource.category ?? "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [resources, search]);

  return (
    <>
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search by title, description or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredResources.length === 0 ? (
        <div className={styles.empty}>
          No matching resources found.
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
            />
          ))}
        </div>
      )}
    </>
  );
}