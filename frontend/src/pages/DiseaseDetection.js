import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import { Bug, AlertTriangle, CheckCircle, ArrowRight, Loader } from 'lucide-react';
import { startDiseaseDetection, submitDiseaseAnswer } from '../services/api';

const DiseaseDetection = () => {
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState({});
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);

  // Start disease detection session
  const startSessionMutation = useMutation(startDiseaseDetection, {
    onSuccess: (data) => {
      setSessionId(data.session_id);
      setCurrentQuestion(data.question);
      setProgress(0);
      setIsCompleted(false);
      setDiagnosis(null);
      setAnswers({});
    },
    onError: (error) => {
      console.error('Failed to start session:', error);
    }
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation(submitDiseaseAnswer, {
    onSuccess: (data) => {
      setProgress(data.progress);
      
      if (data.completed) {
        setIsCompleted(true);
        setDiagnosis(data.diagnosis);
      } else {
        setCurrentQuestion(data.next_question);
      }
    },
    onError: (error) => {
      console.error('Failed to submit answer:', error);
    }
  });

  // Start session on component mount
  useEffect(() => {
    startSessionMutation.mutate();
  }, []);

  const handleAnswerSubmit = (answer) => {
    if (!currentQuestion || !sessionId) return;

    console.log('Current data:', { sessionId, currentQuestion, answer });
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));

    const mutationData = {
      sessionId: sessionId,
      questionId: parseInt(currentQuestion.id),
      answer: answer
    };
    
    console.log('Mutation data:', mutationData);
    submitAnswerMutation.mutate(mutationData);
  };

  const resetDetection = () => {
    setSessionId(null);
    setCurrentQuestion(null);
    setAnswers({});
    setProgress(0);
    setIsCompleted(false);
    setDiagnosis(null);
    startSessionMutation.mutate();
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (startSessionMutation.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3">
          <Loader className="h-8 w-8 animate-spin text-primary-600" />
          <span className="text-gray-600">Initializing disease detection...</span>
        </div>
      </div>
    );
  }

  if (startSessionMutation.error) {
    return (
      <div className="card border-red-200 bg-red-50">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-medium">Initialization Error</h3>
            <p className="text-red-600 text-sm mt-1">
              Failed to start disease detection. Please try again.
            </p>
            <button
              onClick={resetDetection}
              className="btn-secondary mt-3"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Disease Detection</h1>
        <p className="text-gray-600 mt-2">Interactive Q&A system to identify crop diseases and get treatment recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Question Section */}
        <div className="lg:col-span-2 space-y-6">
          {!isCompleted ? (
            <>
              {/* Progress Bar */}
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Question */}
              {currentQuestion && (
                <div className="card">
                  <div className="flex items-start space-x-3 mb-6">
                    <Bug className="h-6 w-6 text-primary-600 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Question {currentQuestion.id}
                      </h2>
                      <p className="text-gray-700 text-lg">
                        {currentQuestion.text}
                      </p>
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {currentQuestion.type}
                      </span>
                    </div>
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSubmit(option)}
                        disabled={submitAnswerMutation.isLoading}
                        className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900">{option}</span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>

                  {submitAnswerMutation.isLoading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader className="h-6 w-6 animate-spin text-primary-600" />
                      <span className="ml-2 text-gray-600">Processing answer...</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Results */
            <div className="space-y-6">
              {diagnosis?.disease ? (
                <>
                  <div className="card">
                    <div className="flex items-center space-x-3 mb-6">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <h2 className="text-xl font-semibold text-gray-900">Diagnosis Complete</h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Identified Disease</h3>
                        <div className="p-4 bg-red-50 rounded-lg">
                          <h4 className="text-xl font-bold text-red-900">{diagnosis.disease}</h4>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(diagnosis.summary.disease.severity)}`}>
                              {diagnosis.summary.disease.severity} Severity
                            </span>
                            <span className="text-sm text-gray-600">
                              Confidence: {(diagnosis.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Symptoms</h3>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {diagnosis.summary.disease.symptoms}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Cause</h3>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {diagnosis.summary.disease.cause}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Treatment & Prevention</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Treatment Recommendations</h4>
                        <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                          {diagnosis.summary.treatment.recommendations}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Prevention Measures</h4>
                        <p className="text-gray-700 bg-green-50 p-3 rounded-lg">
                          {diagnosis.summary.treatment.prevention}
                        </p>
                      </div>
                    </div>
                  </div>

                  {diagnosis.summary.subsidy?.eligible && (
                    <div className="card border-green-200 bg-green-50">
                      <h3 className="text-lg font-semibold text-green-900 mb-2">
                        🎉 Government Subsidy Available
                      </h3>
                      <p className="text-green-800">
                        {diagnosis.summary.subsidy.details}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="card">
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Clear Diagnosis</h3>
                    <p className="text-gray-600 mb-4">
                      Based on your answers, we couldn't confidently identify a specific disease. 
                      The confidence score is {(diagnosis?.confidence * 100).toFixed(1)}%.
                    </p>
                    <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg text-sm">
                      Consider consulting with a local agricultural expert or visiting the nearest 
                      agricultural extension office for personalized advice.
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={resetDetection}
                className="btn-primary w-full"
              >
                Start New Detection
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Answer History */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answers</h3>
            <div className="space-y-3">
              {Object.entries(answers).map(([questionId, answer]) => (
                <div key={questionId} className="border-l-4 border-primary-500 pl-3">
                  <p className="text-sm font-medium text-gray-700">Question {questionId}</p>
                  <p className="text-sm text-gray-600">{answer}</p>
                </div>
              ))}
              {Object.keys(answers).length === 0 && (
                <p className="text-sm text-gray-500 italic">No answers yet</p>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Tips</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Answer questions based on actual field observations</li>
              <li>• Be as specific as possible about symptoms</li>
              <li>• Consider the timeline of symptom appearance</li>
              <li>• Note any visible insects or pests</li>
              <li>• Check multiple plants for consistent symptoms</li>
            </ul>
          </div>

          {/* Emergency Contact */}
          <div className="card bg-red-50 border-red-200">
            <h3 className="text-lg font-semibold text-red-900 mb-2">🚨 Emergency Contact</h3>
            <p className="text-sm text-red-800 mb-2">
              For severe outbreaks or urgent assistance:
            </p>
            <div className="text-sm text-red-700">
              <p>State Agriculture Helpline: 1800-180-1551</p>
              <p>District Agriculture Office: Contact local office</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
