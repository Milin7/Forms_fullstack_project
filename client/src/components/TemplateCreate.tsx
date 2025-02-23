import { useState } from "react";
import { useTemplate } from "../context/TemplateContext";
import { useNavigate } from "react-router-dom";

interface QuestionForm {
  title: string;
  description: string | null;
  type: "string" | "text" | "integer" | "checkbox";
  required: boolean;
  options: string[];
  order: number;
}

export const TemplateCreate = () => {
  const navigate = useNavigate();
  const { createTemplate, fetchTemplates } = useTemplate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!title.trim()) {
        setError("Template title is required");
        return;
      }

      if (questions.length === 0) {
        setError("At least one question is required");
        return;
      }

      const questionsWithOrder = questions.map((q, index) => ({
        title: q.title,
        description: q.description || null,
        type: q.type,
        required: q.required,
        options: q.options,
        order: index,
      }));

      const templateData = {
        title: title.trim(),
        description: description.trim() || null,
        isPublic,
        questions: questionsWithOrder,
      };

      await createTemplate(templateData);
      await fetchTemplates();
      navigate("/templates");
    } catch (err) {
      console.error("Template creation error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create template"
      );
    }
  };

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
      [field]: value,
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Create New Template
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
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
            Create Template
          </button>
        </div>
      </form>
    </div>
  );
};
