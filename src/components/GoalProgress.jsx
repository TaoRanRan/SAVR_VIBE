import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Target, Award, Briefcase } from 'lucide-react';
import { calculateProjectionData, calculateRequiredReturn } from '../utils/financialCalculations';

export default function GoalProgress({ goal, currentAmount = 0, portfolioAnalysis }) {
  const targetAmount = goal.targetAmount;
  const monthlyAmount = goal.monthlySavings;

  const targetDate = new Date(goal.targetDate);
  const today = new Date();
  const monthsRemaining = Math.max(1,
    (targetDate.getFullYear() - today.getFullYear()) * 12 +
    (targetDate.getMonth() - today.getMonth())
  );

  const requiredReturnData = calculateRequiredReturn(
    currentAmount,
    monthlyAmount,
    targetAmount,
    monthsRemaining
  );

  const baseProjectionData = calculateProjectionData(
    currentAmount,
    monthlyAmount,
    monthsRemaining,
    parseFloat(requiredReturnData.requiredAnnualReturn),
    targetAmount
  );

  let chartData = [...baseProjectionData];
  if (portfolioAnalysis?.portfolioReturn && portfolioAnalysis.currentValue !== undefined) {
    const portfolioMonthlyRate = Math.pow(1 + parseFloat(portfolioAnalysis.portfolioReturn) / 100, 1 / 12) - 1;
    let portfolioValue = portfolioAnalysis.currentValue;
    chartData = baseProjectionData.map((point, index) => {
      if (index > 0) portfolioValue = portfolioValue * (1 + portfolioMonthlyRate);
      return { ...point, portfolio: Math.round(portfolioValue) };
    });
  }

  const progress = (currentAmount / targetAmount) * 100;
  const remaining = targetAmount - currentAmount;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Month {label}</p>
          {payload.map((entry, idx) => {
            if (entry.dataKey === 'withGrowth')
              return <div key={idx} className="flex justify-between text-sm"><span style={{ color: entry.color }}>Required Return ({requiredReturnData.requiredAnnualReturn}%):</span><span className="font-mono">${entry.value.toLocaleString()}</span></div>;
            if (entry.dataKey === 'withoutGrowth')
              return <div key={idx} className="flex justify-between text-sm"><span style={{ color: entry.color }}>Savings only (0%):</span><span className="font-mono">${entry.value.toLocaleString()}</span></div>;
            if (entry.dataKey === 'portfolio')
              return <div key={idx} className="flex justify-between text-sm"><span style={{ color: entry.color }}>Current Portfolio:</span><span className="font-mono">${entry.value.toLocaleString()}</span></div>;
            return null;
          })}
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Target:</span>
            <span className="font-mono">${targetAmount.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-primary-500 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <Target className="h-5 w-5 opacity-90" />
            <h3 className="font-semibold">Progress Tracking</h3>
          </div>
          <div className="flex items-center space-x-2 text-sm bg-white/20 px-3 py-1 rounded-full">
            <Award className="h-4 w-4" />
            <span>{progress.toFixed(1)}% Complete</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {portfolioAnalysis && (
          <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-indigo-200 dark:border-gray-600">
            <div className="flex items-center space-x-2 mb-3">
              <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h4 className="font-medium text-gray-900 dark:text-white">Current Portfolio Performance</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Portfolio Return</p><p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{portfolioAnalysis.portfolioReturn}%</p><p className="text-xs text-gray-500">{portfolioAnalysis.lookbackPeriod}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Projected Value</p><p className="text-lg font-bold text-gray-900 dark:text-white">{portfolioAnalysis.projectedValue?.toLocaleString()} SEK</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Avg Fee</p><p className="text-lg font-bold text-gray-900 dark:text-white">{portfolioAnalysis.averageFee}%</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Status</p><p className={`text-lg font-bold ${portfolioAnalysis.isOnTrack ? 'text-green-600' : 'text-orange-600'}`}>{portfolioAnalysis.isOnTrack ? 'On Track' : 'Behind'}</p></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Saved</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentAmount.toLocaleString()} SEK</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">of {targetAmount.toLocaleString()} SEK</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Remaining</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{remaining.toLocaleString()} SEK</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">need to save</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Monthly</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{monthlyAmount.toLocaleString()} SEK</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">saving rate</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Required Return</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{requiredReturnData.requiredAnnualReturn}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">annual to reach goal</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-semibold text-primary-600 dark:text-primary-400">{progress.toFixed(1)}%</span>
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-500 to-purple-600 rounded-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
        </div>

        <div className="h-80 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.3} />
              <XAxis dataKey="month" stroke="#94A3B8" tickFormatter={(v) => `M${v}`} />
              <YAxis stroke="#94A3B8" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={targetAmount} stroke="#94A3B8" strokeDasharray="5 5" label={{ value: 'Target', position: 'right', fill: '#94A3B8', fontSize: 12 }} />
              <Line type="monotone" dataKey="withGrowth" stroke="#6366f1" strokeWidth={2} dot={false} name={`Required Return (${requiredReturnData.requiredAnnualReturn}%)`} />
              <Line type="monotone" dataKey="withoutGrowth" stroke="#10b981" strokeWidth={2} dot={false} name="Savings Only" />
              {portfolioAnalysis && <Line type="monotone" dataKey="portfolio" stroke="#f59e0b" strokeWidth={2} dot={false} name={`Current Portfolio (${portfolioAnalysis.portfolioReturn}%)`} />}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-primary-500 rounded-full"></div><span className="text-sm">Required Return ({requiredReturnData.requiredAnnualReturn}%)</span></div>
            <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div><span className="text-sm">Savings only (0%)</span></div>
            {portfolioAnalysis && <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div><span className="text-sm">Current Portfolio ({portfolioAnalysis.portfolioReturn}%)</span></div>}
            <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-gray-400 rounded-full"></div><span className="text-sm">Target: {targetAmount.toLocaleString()} SEK</span></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{requiredReturnData.message}</p>
        </div>
      </div>
    </div>
  );
}