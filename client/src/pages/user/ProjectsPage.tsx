import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserPageLayout } from "@/components/user/UserPageLayout";
import { FolderKanban, Plus, ExternalLink, Code2 } from "lucide-react";
import { getMyProjects } from "@/services/project.service";

type Project = {
  _id: string;
  title: string;
  prompt: string;
  framework: string;
  status: string;
  generatedPath?: string;
  createdAt: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getMyProjects();
        setProjects(data.projects || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load projects.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  return (
    <UserPageLayout
      title="My Projects"
      subtitle="View and manage the applications you generate with EVOKE."
    >
      {loading && (
        <div className="rounded-2xl border border-[#E9DED3] bg-[#FFFBF7] p-8 text-muted-foreground">
          Loading your projects...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-[#F2DDD3] bg-[#FFF8F5] p-8 text-[#B56557]">
          {error}
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="rounded-2xl border border-[#E9DED3] bg-[#FFFBF7] p-8 text-center">
          <FolderKanban className="mx-auto h-10 w-10 text-primary" />

          <h2 className="mt-4 text-xl font-semibold">
            No projects yet
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Your generated applications will appear here.
          </p>

          <a
            href="/#studio"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#D9966B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#CC8A61]"
          >
            <Plus className="h-4 w-4" />
            Generate your first project
          </a>
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="grid gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className="rounded-2xl border border-[#E9DED3] bg-[#FFFBF7] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {project.title}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {project.prompt}
                  </p>
                </div>

                <span className="rounded-full border border-[#E4D3C3] bg-[#F8EFE7] px-3 py-1 text-xs text-[#A06D4F]">
                  {project.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>Framework: {project.framework}</span>

                <span>
                  Created:{" "}
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>

              {project.generatedPath && (
                <div className="mt-4 text-xs text-muted-foreground">
                  <ExternalLink className="mr-1 inline h-3 w-3" />
                  {project.generatedPath}
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <Link
                  to={`/projects/${project._id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#E0BEA4] bg-[#F8EFE7] px-4 py-2 text-sm font-semibold text-primary transition hover:bg-[#F2E4D8]"
                >
                  <Code2 className="h-4 w-4" />
                  Open Workspace
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </UserPageLayout>
  );
}