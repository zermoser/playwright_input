import React, { useState } from 'react';

function App() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [result, setResult] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAge = Number(age);
    setResult(numAge >= 18 ? 'ผ่าน' : 'ไม่ผ่าน');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Form Test</h1>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
        </div>

        <div
          onSubmit={onSubmit}
          className="space-y-6"
          data-testid="validation-form"
        >
          <div className="space-y-2">
            <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
              ชื่อ
            </label>
            <input
              id="first-name"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="กรอกชื่อของคุณ"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
              นามสกุล
            </label>
            <input
              id="last-name"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="กรอกนามสกุลของคุณ"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">
              อายุ
            </label>
            <input
              id="age"
              type="number"
              value={age}
              onChange={e => setAge(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="กรอกอายุของคุณ"
            />
          </div>

          <button
            type="submit"
            onClick={onSubmit}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            ตรวจสอบผล
          </button>
        </div>

        {result && (
          <div
            className={`mt-6 p-4 rounded-lg text-center font-bold text-lg transition-all duration-300 ${result === 'ผ่าน'
              ? 'bg-green-100 text-green-800 border-2 border-green-200'
              : 'bg-red-100 text-red-800 border-2 border-red-200'
              }`}
            data-testid="result-text"
          >
            <div className="flex items-center justify-center space-x-2">
              {result === 'ผ่าน' ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span>ผลการตรวจสอบ: {result}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;