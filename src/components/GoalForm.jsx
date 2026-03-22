import React, { useState } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';

const goalCategories = [
  { id: 'retirement', label: 'Retirement', emoji: '🏖️', defaultName: 'My Retirement' },
  { id: 'house', label: 'Home Purchase', emoji: '🏠', defaultName: 'My Dream Home' },
  { id: 'education', label: 'Education', emoji: '🎓', defaultName: 'Education Fund' },
  { id: 'car', label: 'Vehicle', emoji: '🚗', defaultName: 'New Car' },
  { id: 'wedding', label: 'Wedding', emoji: '💍', defaultName: 'Wedding' },
  { id: 'travel', label: 'Travel', emoji: '✈️', defaultName: 'Dream Vacation' },
  { id: 'business', label: 'Business', emoji: '💼', defaultName: 'Business Startup' },
  { id: 'other', label: 'Other', emoji: '🎯', defaultName: 'My Goal' }
];

export default function GoalForm({ onSetGoal }) {
  const [goalName, setGoalName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(goalCategories[0]);
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [monthlySavings, setMonthlySavings] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSetGoal({
      name: goalName || selectedCategory.defaultName,
      type: selectedCategory.id,
      categoryLabel: selectedCategory.label,
      targetAmount: Number(targetAmount),
      targetDate,
      monthlySavings: Number(monthlySavings),
    });
  };

  const handleCalculateMonthly = () => {
    if (targetAmount && targetDate) {
      const months = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30));
      if (months > 0) {
        setMonthlySavings(Math.ceil(targetAmount / months));
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Goal Name</label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="e.g., My Dream Home"
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select
                value={selectedCategory.id}
                onChange={(e) => setSelectedCategory(goalCategories.find(c => c.id === e.target.value))}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:text-white"
              >
                {goalCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Amount (SEK)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">kr</span>
                <input
                  type="number"
                  required
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:text-white"
                  placeholder="500,000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Savings (SEK)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">kr</span>
                <input
                  type="number"
                  required
                  value={monthlySavings}
                  onChange={(e) => setMonthlySavings(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:text-white"
                  placeholder="5,000"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCalculateMonthly}
            className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Calculate recommended monthly savings
          </button>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-primary-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <span>Start Saving</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}