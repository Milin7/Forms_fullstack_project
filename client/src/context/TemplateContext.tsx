import { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

export interface Question {
  id?: number;
  title: string;
  description: string | null;
  type: "string" | "text" | "integer" | "checkbox";
  required: boolean;
  order: number;
  options: string[];
  templateId?: number;
}

export interface Template {
  id?: number;
  title: string;
  description: string | null;
  isPublic: boolean;
  userId?: number;
  Questions?: Question[];
  questions?: Question[];
}

interface TemplateContextType {
  templates: Template[] | null;
  currentTemplate: Template | null;
  loading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  fetchTemplate: (id: number) => Promise<void>;
  createTemplate: (template: Omit<Template, "id" | "userId">) => Promise<void>;
  updateTemplate: (id: number, template: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: number) => Promise<void>;
  reorderQuestions: (
    templateId: number,
    questionOrder: number[]
  ) => Promise<void>;
  fetchTemplateResponses: (templateId: number) => Promise<any[]>;
}

const TemplateContext = createContext<TemplateContextType | null>(null);

export const TemplateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/templates`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }

      const data = await response.json();
      console.log("Fetched templates:", data);

      // Ensure questions array exists for each template
      const templatesWithQuestions = data.map((template: Template) => ({
        ...template,
        questions: template.questions || [],
      }));

      setTemplates(templatesWithQuestions);
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchTemplate = async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/templates/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch template");
      }

      const data = await response.json();
      setCurrentTemplate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch template");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (template: Omit<Template, "id" | "userId">) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/templates`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(template),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create template");
      }

      const newTemplate = await response.json();

      // Update the templates list with the new template
      setTemplates(prev => (prev ? [...prev, newTemplate] : [newTemplate]));

      return newTemplate;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create template"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (id: number, template: Partial<Template>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/templates/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(template),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update template");
      }

      const updatedTemplate = await response.json();

      // Update both templates and currentTemplate with the full template data
      setTemplates(prev =>
        prev ? prev.map(t => (t.id === id ? updatedTemplate : t)) : null
      );

      if (currentTemplate?.id === id) {
        setCurrentTemplate(updatedTemplate);
      }

      return updatedTemplate;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update template"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/templates/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete template");
      }

      setTemplates(prev =>
        prev ? prev.filter(template => template.id !== id) : null
      );

      if (currentTemplate?.id === id) {
        setCurrentTemplate(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete template"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reorderQuestions = async (
    templateId: number,
    questionOrder: number[]
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/templates/${templateId}/reorder`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ questionOrder }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reorder questions");
      }

      const updatedTemplate = await response.json();

      if (currentTemplate?.id === templateId) {
        setCurrentTemplate(updatedTemplate);
      }

      setTemplates(prev =>
        prev ? prev.map(t => (t.id === templateId ? updatedTemplate : t)) : null
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reorder questions"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplateResponses = async (templateId: number): Promise<any[]> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/templates/${templateId}/responses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching responses:", error);
      return [];
    }
  };

  const value = {
    templates,
    currentTemplate,
    loading,
    error,
    fetchTemplates,
    fetchTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    reorderQuestions,
    fetchTemplateResponses,
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplate = () => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error("useTemplate must be used within a TemplateProvider");
  }
  return context;
};
