import { useEffect, useState } from "react";
import { useTemplate } from "../context/TemplateContext";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface FormResponse {
  id: string;
  userId: string;
  user: {
    email: string;
  };
  createdAt: string;
  answers: {
    questionId: string;
    value: string | number | boolean;
  }[];
}

interface AggregatedResults {
  [questionId: string]: {
    average?: number;
    mostCommon?: string;
    count: number;
    values: (string | number | boolean)[];
  };
}

export const TemplateView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    fetchTemplate,
    fetchTemplateResponses,
    currentTemplate,
    loading,
    error,
  } = useTemplate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "template" | "responses" | "analytics"
  >("template");
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [aggregatedResults, setAggregatedResults] = useState<AggregatedResults>(
    {}
  );

  useEffect(() => {
    if (id) {
      fetchTemplate(parseInt(id));
      loadResponses();
    }
  }, []);

  const loadResponses = async () => {
    if (id) {
      const fetchedResponses = await fetchTemplateResponses(parseInt(id));
      setResponses(fetchedResponses);
      aggregateResults(fetchedResponses);
    }
  };

  const aggregateResults = (responses: FormResponse[]) => {
    const results: AggregatedResults = {};

    // Initialize results object
    currentTemplate?.Questions?.forEach(question => {
      if (question.id !== undefined) {
        results[question.id] = {
          count: 0,
          values: [],
        };
      }
    });

    // Collect all values
    responses.forEach(response => {
      response.answers.forEach(answer => {
        if (results[answer.questionId]) {
          results[answer.questionId].values.push(answer.value);
          results[answer.questionId].count++;
        }
      });
    });

    // Calculate aggregations
    currentTemplate?.Questions?.forEach(question => {
      if (question.id !== undefined && results[question.id]) {
        const values = results[question.id].values;

        if (question.type === "integer") {
          const numericValues = values.map(v => Number(v));
          const average =
            numericValues.reduce((a, b) => a + b, 0) / values.length;
          results[question.id].average = Number(average.toFixed(2));
        } else if (question.type === "string" || question.type === "text") {
          const frequency: { [key: string]: number } = {};
          values.forEach(value => {
            frequency[String(value)] = (frequency[String(value)] || 0) + 1;
          });
          const mostCommon = Object.entries(frequency).sort(
            ([, a], [, b]) => b - a
          )[0]?.[0];
          results[question.id].mostCommon = mostCommon;
        }
      }
    });

    setAggregatedResults(results);
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

  if (!currentTemplate) {
    return (
      <div className="text-center py-8 text-gray-600">Template not found</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header and navigation */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {currentTemplate?.title}
          </h1>
          <div className="space-x-4">
            <button
              onClick={() => navigate("/templates")}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Back to Templates
            </button>
            {user?.id?.toString() === currentTemplate?.userId && (
              <Link
                to={`/templates/${currentTemplate?.id}/edit`}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-block"
              >
                Edit Template
              </Link>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {["template", "responses", "analytics"].map(tab => (
              <button
                key={tab}
                onClick={() =>
                  setActiveTab(tab as "template" | "responses" | "analytics")
                }
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "template" && (
        <div>
          {/* Template Details */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="space-y-4">
              {currentTemplate.description && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-2">
                    Description
                  </h2>
                  <p className="text-gray-600">{currentTemplate.description}</p>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <span className="mr-4">
                  {currentTemplate?.Questions?.length || 0} Questions
                </span>
                <span>
                  {currentTemplate.isPublic
                    ? "Public Template"
                    : "Private Template"}
                </span>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {currentTemplate?.Questions?.map((question, index) => (
              <div key={question.id} className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Question {index + 1}: {question.title}
                    {question.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h3>
                  {question.description && (
                    <p className="text-gray-600 mt-2">{question.description}</p>
                  )}
                </div>

                <div className="mt-4">
                  <div className="text-sm text-gray-500 mb-2">
                    Answer Type:{" "}
                    {question.type === "checkbox"
                      ? "Multiple Choice"
                      : question.type === "string"
                      ? "Short Answer"
                      : question.type === "text"
                      ? "Long Answer"
                      : "Number"}
                  </div>

                  {/* Preview of answer field */}
                  {question.type === "checkbox" && question.options && (
                    <div className="space-y-2">
                      {question.options.map(
                        (option: string, optionIndex: number) => (
                          <div key={optionIndex} className="flex items-center">
                            <input
                              type="checkbox"
                              disabled
                              className="rounded border-gray-300 text-blue-600"
                            />
                            <label className="ml-2 text-gray-700">
                              {option}
                            </label>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {question.type === "string" && (
                    <input
                      type="text"
                      disabled
                      placeholder="Short answer text"
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
                    />
                  )}

                  {question.type === "text" && (
                    <textarea
                      disabled
                      placeholder="Long answer text"
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
                      rows={3}
                    />
                  )}

                  {question.type === "integer" && (
                    <input
                      type="number"
                      disabled
                      placeholder="0"
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "responses" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Form Responses ({responses.length})
          </h2>
          {responses.map(response => (
            <div key={response.id} className="bg-white rounded-lg shadow p-6">
              <div className="mb-4 text-sm text-gray-500">
                Submitted by: {response.user.email} on{" "}
                {new Date(response.createdAt).toLocaleDateString()}
              </div>
              {response.answers.map(answer => {
                const question = currentTemplate?.Questions?.find(
                  q => q.id === parseInt(answer.questionId)
                );
                return (
                  <div key={answer.questionId} className="mb-4">
                    <p className="font-medium text-gray-700">
                      {question?.title}
                    </p>
                    <p className="mt-1 text-gray-600">{answer.value}</p>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Response Analytics
          </h2>
          {currentTemplate?.Questions?.map(question => (
            <div key={question.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                {question.title}
              </h3>
              <div className="text-gray-600">
                {question.id !== undefined && (
                  <>
                    <p>
                      Total Responses:{" "}
                      {aggregatedResults[question.id]?.count || 0}
                    </p>
                    {question.type === "integer" &&
                      aggregatedResults[question.id]?.average !== undefined && (
                        <p className="mt-2">
                          Average: {aggregatedResults[question.id].average}
                        </p>
                      )}
                    {(question.type === "string" || question.type === "text") &&
                      aggregatedResults[question.id]?.mostCommon && (
                        <p className="mt-2">
                          Most Common Answer:{" "}
                          {aggregatedResults[question.id].mostCommon}
                        </p>
                      )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
