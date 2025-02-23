import { useEffect } from "react";
import { useTemplate } from "../context/TemplateContext";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export const TemplateList = () => {
  const { templates, loading, error, fetchTemplates, deleteTemplate } =
    useTemplate();
  const { user } = useAuth();

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        await fetchTemplates();
      } catch (err) {
        console.error("Error loading templates:", err);
      }
    };
    loadTemplates();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading templates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Form Templates</h1>
        <Link
          to="/templates/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Template
        </Link>
      </div>

      {!templates || templates.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No templates found. Create your first template!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {template.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {template.description || "No description"}
                </p>
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-4">
                      {template.Questions?.length || 0} Questions
                    </span>
                    <span>{template.isPublic ? "Public" : "Private"}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="space-x-2">
                    <Link
                      to={`/templates/${template.id}`}
                      className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded"
                    >
                      View
                    </Link>
                    {user?.id === template.userId && (
                      <>
                        <Link
                          to={`/templates/${template.id}/edit`}
                          className="inline-block bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => {
                            if (
                              template.id &&
                              window.confirm(
                                "Are you sure you want to delete this template?"
                              )
                            ) {
                              deleteTemplate(template.id);
                            }
                          }}
                          className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
