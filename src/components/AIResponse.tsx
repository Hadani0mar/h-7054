
import React from 'react';

interface AIResponseProps {
  response: string;
}

const AIResponse = ({ response }: AIResponseProps) => {
  return (
    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
      <h3 className="text-xl font-semibold mb-2 text-green-400">استجابة النظام:</h3>
      <div className="whitespace-pre-wrap text-white" dir="rtl">
        {response}
      </div>
    </div>
  );
};

export default AIResponse;
