import { getCourseCatalog, isOpenToAll } from "@/lib/courses";
import { getMenteeAccess } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Courses | Mentee",
};

export default async function MenteeCoursesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [catalog, access] = await Promise.all([
    getCourseCatalog(),
    getMenteeAccess(user.id),
  ]);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Courses</h1>
        <p className={styles.subtitle}>
          Self-paced courses from our partner educators, open to every member,
          Free plan included.
        </p>
      </div>

      {catalog.length === 0 ? (
        <div className={styles.empty}>No courses are listed right now. Check back soon.</div>
      ) : (
        catalog.map((provider) => (
          <section key={provider.id} className={styles.provider} aria-labelledby={`p-${provider.id}`}>
            <h2 id={`p-${provider.id}`} className={styles.providerName}>
              {provider.name}
            </h2>
            <ul className={styles.grid}>
              {provider.courses.map((course) => {
                const locked = !access.hasAccess && !isOpenToAll(course);
                return (
                  <li key={course.id} className={styles.card}>
                    <div className={styles.badges}>
                      {course.featured && <span className={styles.featured}>Featured</span>}
                      {isOpenToAll(course) && <span className={styles.free}>Free for members</span>}
                    </div>
                    <h3 className={styles.courseTitle}>{course.title}</h3>
                    {course.length && <p className={styles.length}>{course.length}</p>}
                    <p className={styles.description}>{course.description}</p>
                    {locked ? (
                      <Link href="/dashboard/mentee/subscription" className={styles.secondary}>
                        Included with Growth and Premium
                      </Link>
                    ) : (
                      <a
                        href={course.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.cta}
                        aria-label={`Start ${course.title} on ${course.providerName} (opens in new tab)`}
                      >
                        Start course ↗
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
