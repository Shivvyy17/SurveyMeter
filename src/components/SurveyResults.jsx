import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export default function SurveyResults({ survey }) {
  if (!survey) return null;

  const counts = survey.questions.map((q, qi) => {
    const countMap = {};
    q.options.forEach((opt) => (countMap[opt] = 0));
    survey.responses.forEach((resp) => {
      const answer = resp.answers[qi];
      if (answer) countMap[answer]++;
    });
    return countMap;
  });

  return (
    <div className="survey-results p-4">
      <h3 className="text-xl font-bold mb-4">Results for: {survey.title}</h3>
      {survey.questions.map((q, i) => {
        const chartData = q.options.map((opt) => ({
          option: opt,
          votes: counts[i][opt],
        }));

        return (
          <div key={q.id} className="result-question mb-8">
            <h4 className="text-lg font-semibold mb-2">{q.questionText}</h4>

            {/* Votes in list form */}
            <ul className="mb-2">
              {q.options.map((opt) => (
                <li key={opt}>
                  {opt}: {counts[i][opt]} votes
                </li>
              ))}
            </ul>

            {/* Recharts Bar Graph with styling */}
            <div className="chart-container h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="option" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="votes" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}
