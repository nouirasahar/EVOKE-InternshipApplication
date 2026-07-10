import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserPageLayout } from "@/components/user/UserPageLayout";
import { getProjectById, Project } from "@/services/project.service";
import { FileCode2, Folder, Loader2 } from "lucide-react";

export default function ProjectWorkspacePage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState<Project["files"][number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProject = async () => {
      try {
        if (!id) return;

        const data = await getProjectById(id);
        const loadedProject = data.project;

        setProject(loadedProject);
        setSelectedFile(loadedProject.files?.[0] || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load project.");
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  return (
    <UserPageLayout
      title={project?.title || "Project Workspace"}
      subtitle="Browse and inspect the generated application files."
    >
      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-6 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading workspace...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && project && (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <Folder className="h-4 w-4 text-cyan-400" />
              Files
            </div>

            <div className="space-y-2">
              {project.files && project.files.length > 0 ? (
                project.files.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                      selectedFile?.path === file.path
                        ? "bg-cyan-400/10 text-cyan-300"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    <FileCode2 className="h-4 w-4" />
                    <span className="truncate">{file.path}</span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No generated files found.
                </p>
              )}
            </div>
          </aside>

          <section className="rounded-2xl border border-white/10 bg-black/20">
            <div className="border-b border-white/10 px-5 py-4">
              <p className="text-sm font-semibold">
                {selectedFile?.path || "No file selected"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {selectedFile?.language || "plain text"}
              </p>
            </div>

            <pre className="min-h-[500px] overflow-auto p-5 text-sm text-cyan-50">
              <code>{selectedFile?.content || "Select a file to view its content."}</code>
            </pre>
          </section>
        </div>
      )}
    </UserPageLayout>
  );
}