import { useState, useEffect } from "react";
import { useTemplate } from "../context/TemplateContext";
import { useNavigate, useParams } from "react-router-dom";

interface QuestionForm {
  id?: number;
  title: string;
  description: string | null;
  type: "string" | "text" | "integer" | "checkbox";
  required: boolean;
  options: string[];
  order: number;
  templateId?: number;
}

export const TemplateEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    fetchTemplate,
    updateTemplate,
    currentTemplate,
    loading,
    error,
    fetchTemplates,
  } = useTemplate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const loadTemplate = async () => {
      if (id) {
        try {
          await fetchTemplate(parseInt(id));
        } catch (err) {
          setFormError(
            err instanceof Error ? err.message : "Failed to load template"
          );
        }
      }
    };
    loadTemplate();
  }, [id]);

  useEffect(() => {
    if (currentTemplate) {
      setTitle(currentTemplate.title);
      setDescription(currentTemplate.description || "");
      setIsPublic(currentTemplate.isPublic);
      setQuestions(
        currentTemplate.Questions?.map(q => ({
          ...q,
          description: q.description || "",
          options: q.options || [],
        })) || []
      );
    }
  }, [currentTemplate]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        title: "",
        description: null,
        type: "string",
        required: false,
        options: [],
        order: questions.length,
      },
    ]);
  };

  const handleQuestionChange = (
    index: number,
    field: keyof QuestionForm,
    value: any
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: field === "description" ? value || null : value,
    };
    setQuestions(updatedQuestions);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleAddOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push("");
    setQuestions(updatedQuestions);
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!id) {
        throw new Error("Template ID is missing");
      }

      if (!title.trim()) {
        setFormError("Template title is required");
        return;
      }

      if (questions.length === 0) {
        setFormError("At least one question is required");
        return;
      }

      const questionsWithOrder = questions.map((q, index) => ({
        ...q,
        order: index,
        templateId: parseInt(id),
        description: q.description || null,
      }));

      await updateTemplate(parseInt(id), {
        title: title.trim(),
        description: description.trim() || null,
        isPublic,
        questions: questionsWithOrder,
      });

      await fetchTemplates();
      navigate("/templates");
    } catch (err) {
      console.error("Template update error:", err);
      setFormError(
        err instanceof Error ? err.message : "Failed to update template"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading template...</div>
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Template</h1>

      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Template Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                rows={3}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={e => setIsPublic(e.target.checked)}
                className="rounded border-gray-300 text-blue-600"
              />
              <label className="ml-2 text-sm text-gray-700">
                Make this template public
              </label>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Questions</h2>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Question
            </button>
          </div>

          {questions.map((question, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4 bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium">Question {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Question Title *
                  </label>
                  <input
                    type="text"
                    value={question.title}
                    onChange={e =>
                      handleQuestionChange(index, "title", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={question.description || ""}
                    onChange={e =>
                      handleQuestionChange(index, "description", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Question Type
                  </label>
                  <select
                    value={question.type}
                    onChange={e =>
                      handleQuestionChange(
                        index,
                        "type",
                        e.target.value as QuestionForm["type"]
                      )
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="string">Short Answer</option>
                    <option value="text">Long Answer</option>
                    <option value="integer">Number</option>
                    <option value="checkbox">Multiple Choice</option>
                  </select>
                </div>

                {question.type === "checkbox" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Options
                    </label>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={option}
                          onChange={e =>
                            handleOptionChange(
                              index,
                              optionIndex,
                              e.target.value
                            )
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm"
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index, optionIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddOption(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Add Option
                    </button>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={e =>
                      handleQuestionChange(index, "required", e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Required question
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/templates")}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
