import React, { useState } from 'react';
import { TrendingUp, PieChart, Calculator, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { getAllocationStrategy } from '../utils/financialCalculations';

const fundData = {
  stocks: [
    { id: 'lf-sweden', name: 'Länsförsäkringar Sverige Indexnära', category: 'Sweden Stock Fund', risk: 'Medium', returns: { '1y': 16.5, '3y': 13.0, '5y': 12.0 }, fee: 0.22 },
    { id: 'spiltan-investment', name: 'Spiltan Aktiefond Investmentbolag', category: 'Sweden Stock Fund', risk: 'High', returns: { '1y': 22.5, '3y': 19.0, '5y': 17.0 }, fee: 0.26 },
    { id: 'lf-global', name: 'Länsförsäkringar Global Indexnära', category: 'Global Stock Fund', risk: 'Medium', returns: { '1y': -6.0, '3y': 13.3, '5y': 13.9 }, fee: 0.215 },
    { id: 'spp-global', name: 'SPP Global Plus', category: 'Global Stock Fund', risk: 'High', returns: { '1y': 0.0, '3y': 14.0, '5y': 13.5 }, fee: 0.355 }
  ],
  bonds: [
    { id: 'amf-rante-long', name: 'AMF Räntefond Lång', category: 'Government Bond Fund', risk: 'Low', returns: { '1y': 2.0, '3y': 0.5, '5y': 0.5 }, fee: 0.10 },
    { id: 'spiltan-rante', name: 'Spiltan Räntefond Sverige', category: 'Government Bond Fund', risk: 'Low–Medium', returns: { '1y': 3.5, '3y': 2.5, '5y': 2.5 }, fee: 0.20 },
    { id: 'swedbank-corporate-europe', name: 'Swedbank Robur Corporate Bond Europe IG', category: 'Corporate Bond Fund', risk: 'Low', returns: { '1y': 3.3, '3y': 1.5, '5y': 1.3 }, fee: 0.69 },
    { id: 'swedbank-corporate-nordic', name: 'Swedbank Robur Corporate Bond Nordic', category: 'Corporate Bond Fund', risk: 'Medium', returns: { '1y': 4.1, '3y': 2.5, '5y': 2.5 }, fee: 0.40 },
    { id: 'spiltan-hograte', name: 'Spiltan Högräntefond', category: 'Corporate Bond Fund', risk: 'High', returns: { '1y': 7.0, '3y': 5.5, '5y': 5.5 }, fee: 0.75 }
  ],
  cash: [
    { id: 'ancoria-money-market', name: 'Ancoria Money Market Fund SEK', category: 'Money Market', risk: 'Low', returns: { '1y': 1.7, '3y': 1.7, '5y': 1.7 }, fee: 0.30 },
    { id: 'amf-rante-kort', name: 'AMF Räntefond Kort', category: 'Money Market', risk: 'Low', returns: { '1y': 3.5, '3y': 3.5, '5y': 3.5 }, fee: 0.125 }
  ]
};

const selectFunds = (requiredReturn) => {
  const r = parseFloat(requiredReturn);
  let stockFunds = [], bondFunds = [], cashFunds = [];

  if (r > 15) stockFunds = [fundData.stocks[1], fundData.stocks[3]];
  else if (r > 10) stockFunds = [fundData.stocks[3], fundData.stocks[2], fundData.stocks[1]];
  else if (r > 7) stockFunds = [fundData.stocks[2], fundData.stocks[0], fundData.stocks[3]];
  else if (r > 4) stockFunds = [fundData.stocks[0], fundData.stocks[2]];
  else stockFunds = [fundData.stocks[0]];

  if (r > 10) bondFunds = [fundData.bonds[4]];
  else if (r > 7) bondFunds = [fundData.bonds[3], fundData.bonds[1]];
  else if (r > 4) bondFunds = [fundData.bonds[1], fundData.bonds[0]];
  else bondFunds = [fundData.bonds[0], fundData.bonds[1]];

  cashFunds = r > 8 ? [fundData.cash[1]] : [fundData.cash[0], fundData.cash[1]];
  return { stockFunds, bondFunds, cashFunds };
};

export default function FundRecommendations({ goal, monthlyAmount, monthsRemaining, targetAmount }) {
  const [showDetails, setShowDetails] = useState(false);

  const requiredReturnData = (() => {
    if (monthsRemaining <= 0 || targetAmount <= 0) return { requiredAnnualReturn: '0.00', riskLevel: 'Very Low', message: 'Goal already reached' };
    const totalContributions = monthlyAmount * monthsRemaining;
    if (totalContributions >= targetAmount) return { requiredAnnualReturn: '0.00', riskLevel: 'Very Low', message: 'Savings alone will reach goal' };
    const required = (Math.pow(targetAmount / (monthlyAmount * monthsRemaining + 1), 12 / monthsRemaining) - 1) * 100;
    const capped = Math.min(required, 30);
    let riskLevel = 'Moderate', message = '';
    if (capped > 20) { riskLevel = 'Extreme'; message = 'Very aggressive growth needed'; }
    else if (capped > 15) { riskLevel = 'High'; message = 'Aggressive growth strategy'; }
    else if (capped > 10) { riskLevel = 'Moderate-High'; message = 'Growth-focused portfolio'; }
    else if (capped > 7) { riskLevel = 'Moderate'; message = 'Balanced approach'; }
    else if (capped > 4) { riskLevel = 'Low-Moderate'; message = 'Conservative growth'; }
    else { riskLevel = 'Low'; message = 'Very conservative approach'; }
    return { requiredAnnualReturn: capped.toFixed(2), riskLevel, message };
  })();

  const allocation = getAllocationStrategy(parseFloat(requiredReturnData.requiredAnnualReturn), monthsRemaining, requiredReturnData.riskLevel);
  const { stockFunds, bondFunds, cashFunds } = selectFunds(requiredReturnData.requiredAnnualReturn);

  const stockMonthly = monthlyAmount * (allocation.stocks / 100);
  const bondMonthly = monthlyAmount * (allocation.bonds / 100);
  const cashMonthly = monthlyAmount * (allocation.cash / 100);

  const stockAllocations = stockFunds.map(f => ({ ...f, monthlyAmount: stockMonthly / stockFunds.length }));
  const bondAllocations = bondFunds.map(f => ({ ...f, monthlyAmount: bondMonthly / bondFunds.length }));
  const cashAllocations = cashFunds.map(f => ({ ...f, monthlyAmount: cashMonthly / cashFunds.length }));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary-600 to-purple-600 rounded-2xl shadow-xl text-white overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2"><Calculator className="h-5 w-5 opacity-90" /><h3 className="text-lg font-semibold">Portfolio Analysis</h3></div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${requiredReturnData.riskLevel === 'High' || requiredReturnData.riskLevel === 'Extreme' ? 'bg-red-500/30 text-red-100' : requiredReturnData.riskLevel === 'Moderate' || requiredReturnData.riskLevel === 'Moderate-High' ? 'bg-yellow-500/30 text-yellow-100' : 'bg-green-500/30 text-green-100'}`}>{requiredReturnData.riskLevel} Risk</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white/10 rounded-lg p-3"><p className="text-xs opacity-80 mb-1">Required Return</p><p className="text-2xl font-bold">{requiredReturnData.requiredAnnualReturn}%</p></div>
            <div className="bg-white/10 rounded-lg p-3"><p className="text-xs opacity-80 mb-1">Time Horizon</p><p className="text-2xl font-bold">{(monthsRemaining / 12).toFixed(1)} years</p></div>
            <div className="bg-white/10 rounded-lg p-3"><p className="text-xs opacity-80 mb-1">Monthly Savings</p><p className="text-2xl font-bold">{monthlyAmount?.toLocaleString()} SEK</p></div>
            <div className="bg-white/10 rounded-lg p-3"><p className="text-xs opacity-80 mb-1">Target Amount</p><p className="text-2xl font-bold">{targetAmount?.toLocaleString()} SEK</p></div>
          </div>
          <p className="text-sm bg-black/20 rounded-lg p-3">{requiredReturnData.message || 'Analysis complete'}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"><PieChart className="h-5 w-5 text-primary-500 mr-2" />Recommended Asset Allocation</h4>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#6366f1" strokeWidth="20" strokeDasharray={`${allocation.stocks * 2.51} 251`} strokeLinecap="butt" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="20" strokeDasharray={`${allocation.bonds * 2.51} 251`} strokeDashoffset={-allocation.stocks * 2.51} strokeLinecap="butt" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="20" strokeDasharray={`${allocation.cash * 2.51} 251`} strokeDashoffset={-(allocation.stocks + allocation.bonds) * 2.51} strokeLinecap="butt" />
            </svg>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex justify-between"><div className="flex items-center space-x-2"><div className="w-3 h-3 bg-primary-500 rounded-full"></div><span>Stocks</span></div><span className="font-semibold">{allocation.stocks}%</span></div>
            <div className="flex justify-between"><div className="flex items-center space-x-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div><span>Bonds</span></div><span className="font-semibold">{allocation.bonds}%</span></div>
            <div className="flex justify-between"><div className="flex items-center space-x-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div><span>Cash/Money Market</span></div><span className="font-semibold">{allocation.cash}%</span></div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">{allocation.description}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center"><TrendingUp className="h-5 w-5 text-primary-500 mr-2" />Recommended Funds</h4>
          <button onClick={() => setShowDetails(!showDetails)} className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center">{showDetails ? 'Show Less' : 'Show Details'}{showDetails ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}</button>
        </div>

        <div className="mb-6"><h5 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center"><div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>Stocks ({allocation.stocks}% of portfolio)</h5>
          <div className="space-y-3">{stockAllocations.map(f => (
            <div key={f.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md">
              <div className="flex justify-between"><div><h6 className="font-semibold">{f.name}</h6><p className="text-sm text-gray-600">{f.category}</p><div className="flex space-x-4 mt-2 text-xs"><span className={f.risk === 'High' ? 'text-orange-600' : f.risk.includes('Medium') ? 'text-yellow-600' : 'text-green-600'}>{f.risk} Risk</span><span>Fee: {f.fee}%</span></div>{showDetails && <div className="mt-2 flex space-x-3 text-xs"><span>1y: {f.returns['1y'] > 0 ? '+' : ''}{f.returns['1y']}%</span><span>3y: +{f.returns['3y']}%</span><span>5y: +{f.returns['5y']}%</span></div>}</div><div className="text-right"><p className="text-sm text-gray-500">Monthly</p><p className="text-lg font-bold text-primary-600">{Math.round(f.monthlyAmount).toLocaleString()} SEK</p></div></div>
            </div>))}</div>
        </div>

        <div className="mb-6"><h5 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>Bonds ({allocation.bonds}% of portfolio)</h5>
          <div className="space-y-3">{bondAllocations.map(f => (
            <div key={f.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"><div className="flex justify-between"><div><h6 className="font-semibold">{f.name}</h6><p className="text-sm text-gray-600">{f.category}</p><div className="flex space-x-4 mt-2 text-xs"><span className="text-green-600">{f.risk} Risk</span><span>Fee: {f.fee}%</span></div>{showDetails && <div className="mt-2 flex space-x-3 text-xs"><span>1y: +{f.returns['1y']}%</span><span>3y: +{f.returns['3y']}%</span><span>5y: +{f.returns['5y']}%</span></div>}</div><div className="text-right"><p className="text-sm text-gray-500">Monthly</p><p className="text-lg font-bold text-green-600">{Math.round(f.monthlyAmount).toLocaleString()} SEK</p></div></div></div>))}</div>
        </div>

        <div><h5 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center"><div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>Cash/Money Market ({allocation.cash}% of portfolio)</h5>
          <div className="space-y-3">{cashAllocations.map(f => (
            <div key={f.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"><div className="flex justify-between"><div><h6 className="font-semibold">{f.name}</h6><p className="text-sm text-gray-600">{f.category}</p><div className="flex space-x-4 mt-2 text-xs"><span className="text-green-600">{f.risk} Risk</span><span>Fee: {f.fee}%</span></div></div><div className="text-right"><p className="text-sm text-gray-500">Monthly</p><p className="text-lg font-bold text-orange-600">{Math.round(f.monthlyAmount).toLocaleString()} SEK</p></div></div></div>))}</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-blue-200 dark:border-gray-600">
        <div className="flex items-start space-x-3"><AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" /><div><h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Portfolio Rebalancing Advice</h5><p className="text-xs text-gray-600 dark:text-gray-300">Review your portfolio quarterly. If any asset class deviates by more than 5% from target, rebalance by directing new contributions to underweight categories. Consider annual rebalancing to maintain your risk profile as you get closer to your goal date.</p></div></div>
      </div>
    </div>
  );
}