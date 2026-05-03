import React, { useState, useEffect } from 'react';
import { useMutation } from 'react-query';
import { Bug, AlertTriangle, CheckCircle, ArrowRight, Loader } from 'lucide-react';
import { startDiseaseDetection, submitDiseaseAnswer } from '../services/api';

const DiseaseDetection = () => {
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState({});
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);

  const startSessionMutation = useMutation(startDiseaseDetection, {
    onSuccess: (data) => {
      setSessionId(data.session_id);
      setCurrentQuestion(data.question);
      setProgress(0);
      setIsCompleted(false);
      setDiagnosis(null);
      setAnswers({});
    },
  });

  const submitAnswerMutation = useMutation(submitDiseaseAnswer, {
    onSuccess: (data) => {
      setProgress(data.progress || 0);
      if (data.completed) {
        setIsCompleted(true);
        setDiagnosis(data.diagnosis || null);
      } else if (data.next_question) {
        setCurrentQuestion(data.next_question);
      }
    },
    onError: (error) => {
      console.error('Submit answer error:', error);
      alert('Failed to submit answer. Please try again.');
    }
  });

  useEffect(() => {
    startSessionMutation.mutate();
  }, []);

  const handleAnswerSubmit = (answer) => {
    if (!currentQuestion || !sessionId) return;
    const questionId = currentQuestion.id;
    if (!questionId || !answer || answer.trim() === '') return;

    setAnswers(prev => ({
      ...prev,
      [questionId]: { question: currentQuestion.text, answer: answer }
    }));
    
    submitAnswerMutation.mutate({
      session_id: sessionId,
      question_id: parseInt(questionId),
      answer: answer.trim()
    });
  };

  const resetDetection = () => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Disease Detection</h1>
        <p className="text-gray-600 mt-2">Interactive Q&A system to identify crop diseases</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {!isCompleted ? (
            <>
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              {currentQuestion && (
                <div className="card">
                  <div className="flex items-start space-x-3 mb-6">
                    <Bug className="h-6 w-6 text-primary-600 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Question {currentQuestion.id}</h2>
                      <p className="text-gray-700 text-lg">{currentQuestion.text}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSubmit(option)}
                        disabled={submitAnswerMutation.isLoading}
                        className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            // RESULTS SECTION
            <div className="space-y-6">
              {diagnosis ? (
                <>
                  <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Diagnosis Complete</h2>
                    <div className="p-4 bg-red-50 rounded-lg">
                      {/* FIX: Access .name property instead of the whole object */}
                      <h4 className="text-xl font-bold text-red-900">{diagnosis.disease?.name || 'Unknown Disease'}</h4>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(diagnosis.disease?.severity)}`}>
                          {diagnosis.disease?.severity || 'N/A'} Severity
                        </span>
                        <span className="text-sm text-gray-600">
                          Confidence: {(diagnosis.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Treatment & Prevention</h3>
                    <div className="space-y-4">
                      <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                        <strong>Treatment:</strong> {diagnosis.treatment?.recommendations || 'No recommendations'}
                      </p>
                      <p className="text-gray-700 bg-green-50 p-3 rounded-lg">
                        <strong>Prevention:</strong> {diagnosis.treatment?.prevention || 'No prevention steps'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="card text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <p>No clear diagnosis found.</p>
                </div>
              )}
              <button onClick={resetDetection} className="btn-primary w-full">Start New Detection</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
