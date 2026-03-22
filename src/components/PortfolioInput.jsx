import React, { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, AlertCircle, Search } from 'lucide-react';
import { calculateRequiredReturn as calcRequiredReturn } from '../utils/financialCalculations';

const fundDatabase = [
  { id: 'lf-sweden-index', name: 'Länsförsäkringar Sverige Indexnära', category: 'Sweden Stock Fund', risk: 'Medium', returns: { '1y': 16.5, '3y': 13.0, '5y': 12.0 }, fee: 0.22 },
  { id: 'spiltan-investment', name: 'Spiltan Aktiefond Investmentbolag', category: 'Sweden Stock Fund', risk: 'High', returns: { '1y': 22.5, '3y': 19.0, '5y': 17.0 }, fee: 0.26 },
  { id: 'lf-global-index', name: 'Länsförsäkringar Global Indexnära', category: 'Global Stock Fund', risk: 'Medium', returns: { '1y': -6.0, '3y': 13.3, '5y': 13.9 }, fee: 0.215 },
  { id: 'spp-global-plus', name: 'SPP Global Plus', category: 'Global Stock Fund', risk: 'High', returns: { '1y': 0.0, '3y': 14.0, '5y': 13.5 }, fee: 0.355 },
  { id: 'amf-rante-long', name: 'AMF Räntefond Lång', category: 'Government Bond Fund', risk: 'Low', returns: { '1y': 2.0, '3y': 0.5, '5y': 0.5 }, fee: 0.10 },
  { id: 'spiltan-rante', name: 'Spiltan Räntefond Sverige', category: 'Government Bond Fund', risk: 'Low–Medium', returns: { '1y': 3.5, '3y': 2.5, '5y': 2.5 }, fee: 0.20 },
  { id: 'swedbank-corporate-europe', name: 'Swedbank Robur Corporate Bond Europe IG', category: 'Corporate Bond Fund', risk: 'Low', returns: { '1y': 3.3, '3y': 1.5, '5y': 1.3 }, fee: 0.69 },
  { id: 'swedbank-corporate-nordic', name: 'Swedbank Robur Corporate Bond Nordic', category: 'Corporate Bond Fund', risk: 'Medium', returns: { '1y': 4.1, '3y': 2.5, '5y': 2.5 }, fee: 0.40 },
  { id: 'spiltan-hograte', name: 'Spiltan Högräntefond', category: 'Corporate Bond Fund', risk: 'High', returns: { '1y': 7.0, '3y': 5.5, '5y': 5.5 }, fee: 0.75 },
  { id: 'ancoria-money-market', name: 'Ancoria Money Market Fund SEK', category: 'Money Market', risk: 'Low', returns: { '1y': 1.7, '3y': 1.7, '5y': 1.7 }, fee: 0.30 },
  { id: 'amf-rante-kort', name: 'AMF Räntefond Kort', category: 'Money Market', risk: 'Low', returns: { '1y': 3.5, '3y': 3.5, '5y': 3.5 }, fee: 0.125 }
];

export default function PortfolioInput({ onAnalyze, goal, monthsRemaining }) {
  const [holdings, setHoldings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const filteredFunds = searchTerm.length >= 2 ? fundDatabase.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.category.toLowerCase().includes(searchTerm.toLowerCase())) : [];

  const addHolding = (fund) => {
    setHoldings([...holdings, { id: Date.now(), ...fund, allocation: 0, value: 0 }]);
    setSearchTerm('');
    setShowSearch(false);
  };

  const removeHolding = (id) => setHoldings(holdings.filter(h => h.id !== id));
  const updateHolding = (id, field, val) => setHoldings(holdings.map(h => h.id === id ? { ...h, [field]: parseFloat(val) || 0 } : h));

  const normalizeAllocations = () => {
    const total = holdings.reduce((s, h) => s + (h.allocation || 0), 0);
    if (total === 0) return;
    setHoldings(holdings.map(h => ({ ...h, allocation: Number(((h.allocation || 0) / total * 100).toFixed(1)) })));
  };

  const calculatePortfolioStats = () => {
    if (holdings.length === 0) return null;
    let lookbackYears = monthsRemaining <= 12 ? 1 : monthsRemaining <= 36 ? 3 : 5;
    const returnKey = lookbackYears === 1 ? '1y' : lookbackYears === 3 ? '3y' : '5y';
    let totalValue = 0, weightedReturn = 0, weightedFee = 0;
    holdings.forEach(h => {
      const weight = h.value > 0 ? h.value : h.allocation;
      totalValue += weight;
      weightedReturn += weight * (h.returns?.[returnKey] || 0);
      weightedFee += weight * (h.fee || 0);
    });
    if (totalValue === 0) return null;
    const portfolioReturn = weightedReturn / totalValue;
    const avgFee = weightedFee / totalValue;
    const monthlyRate = Math.pow(1 + portfolioReturn / 100, 1 / 12) - 1;
    let projected = totalValue;
    for (let i = 0; i < monthsRemaining; i++) projected = projected * (1 + monthlyRate);
    return { annualReturn: portfolioReturn, lookbackYears, lookbackLabel: lookbackYears === 1 ? '1 year' : lookbackYears === 3 ? '3 years' : '5 years', averageFee: avgFee, totalValue, projectedValue: Math.round(projected) };
  };

  const computeAndSend = () => {
    if (!goal || holdings.length === 0) { onAnalyze(null); setAnalysisResult(null); return; }
    const stats = calculatePortfolioStats();
    if (!stats) { onAnalyze(null); setAnalysisResult(null); return; }
    const required = calcRequiredReturn(stats.totalValue, goal.monthlySavings || 0, goal.targetAmount, monthsRemaining);
    const isOnTrack = stats.projectedValue >= goal.targetAmount;
    const gap = goal.targetAmount - stats.projectedValue;
    const result = {
      isOnTrack, projectedValue: stats.projectedValue, portfolioReturn: stats.annualReturn.toFixed(2),
      lookbackPeriod: stats.lookbackLabel, averageFee: stats.averageFee.toFixed(2), gap: Math.max(0, Math.round(gap)),
      requiredReturn: required.requiredAnnualReturn, currentValue: stats.totalValue, recommendations: []
    };
    if (!isOnTrack) {
      const returnNeeded = parseFloat(required.requiredAnnualReturn) - stats.annualReturn;
      if (returnNeeded > 8) result.recommendations.push({ text: 'Consider switching to higher-growth funds like Spiltan Aktiefond Investmentbolag or SPP Global Plus' });
      else if (returnNeeded > 4) result.recommendations.push({ text: 'Increase allocation to global equity funds like Länsförsäkringar Global Indexnära' });
      else if (returnNeeded > 0) result.recommendations.push({ text: 'Minor adjustments to your portfolio could help – consider reducing bond allocation slightly' });
      if (holdings.some(h => h.category.includes('Bond') || h.category.includes('Money Market')) && returnNeeded > 5)
        result.recommendations.push({ text: 'Reduce bond allocation by 20‑30% and reinvest in equities' });
    } else result.recommendations.push({ text: 'Your current portfolio is on track! Rebalance annually to maintain this allocation.' });
    onAnalyze(result);
    setAnalysisResult(result);
  };

  useEffect(() => { computeAndSend(); }, [holdings, goal, monthsRemaining]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-primary-500 to-purple-600 px-6 py-4"><h3 className="text-lg font-semibold text-white flex items-center"><TrendingUp className="h-5 w-5 mr-2" />Current Portfolio Analysis<span className="ml-2 text-xs font-normal bg-white/20 px-2 py-0.5 rounded-full">live updates</span></h3></div>
      <div className="p-6">
        <div className="mb-6">
          <button onClick={() => setShowSearch(!showSearch)} className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 mb-2"><Plus className="h-4 w-4" /><span>Add Fund to Portfolio</span></button>
          {showSearch && (
            <div className="relative">
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800"><Search className="h-5 w-5 text-gray-400 ml-3" /><input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search funds..." className="w-full px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none" autoFocus /></div>
              {filteredFunds.length > 0 && <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border rounded-lg shadow-xl max-h-96 overflow-y-auto">{filteredFunds.map(f => (<button key={f.id} onClick={() => addHolding(f)} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b"><div className="font-medium">{f.name}</div><div className="text-xs text-gray-500">{f.category} • {f.risk} Risk • Fee {f.fee}%</div></button>))}</div>}
            </div>
          )}
        </div>

        {holdings.length > 0 ? (
          <div className="space-y-4 mb-6"><h4 className="font-medium text-gray-700 dark:text-gray-300">Your Holdings</h4>{holdings.map(h => (
            <div key={h.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"><div className="flex justify-between mb-3"><div><div className="font-medium">{h.name}</div><div className="text-xs text-gray-500">{h.category}</div></div><button onClick={() => removeHolding(h.id)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button></div>
            <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs text-gray-500 mb-1">Current Value (SEK)</label><input type="number" value={h.value || ''} onChange={e => updateHolding(h.id, 'value', e.target.value)} placeholder="0" className="w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Allocation (%)</label><input type="number" value={h.allocation || ''} onChange={e => updateHolding(h.id, 'allocation', e.target.value)} placeholder="0" className="w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm" /></div></div></div>))}</div>
        ) : <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-xl"><p>No funds added yet.</p><p className="text-sm mt-2">Click "Add Fund to Portfolio" to get started.</p></div>}

        {holdings.length > 0 && <button onClick={normalizeAllocations} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 underline self-start mb-6">Normalize allocations to 100%</button>}

        {analysisResult && (
          <div className={`mt-6 p-5 rounded-xl border ${analysisResult.isOnTrack ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200'}`}>
            <div className="flex items-start space-x-3"><AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${analysisResult.isOnTrack ? 'text-green-600' : 'text-orange-600'}`} /><div><h4 className={`font-semibold mb-3 ${analysisResult.isOnTrack ? 'text-green-800' : 'text-orange-800'}`}>{analysisResult.isOnTrack ? '✓ Your portfolio is on track to reach the goal!' : '⚠️ Portfolio adjustment needed'}</h4>
            <div className="grid grid-cols-2 gap-3 mb-4"><div className="bg-white dark:bg-gray-800 rounded-lg p-3"><p className="text-xs text-gray-500">Projected Value</p><p className="text-lg font-bold">{analysisResult.projectedValue.toLocaleString()} SEK</p></div><div className="bg-white dark:bg-gray-800 rounded-lg p-3"><p className="text-xs text-gray-500">Portfolio Return</p><p className="text-lg font-bold text-indigo-600">{analysisResult.portfolioReturn}%</p><p className="text-xs text-gray-500">{analysisResult.lookbackPeriod}</p></div><div className="bg-white dark:bg-gray-800 rounded-lg p-3"><p className="text-xs text-gray-500">Required Return</p><p className="text-lg font-bold text-orange-600">{analysisResult.requiredReturn}%</p></div><div className="bg-white dark:bg-gray-800 rounded-lg p-3"><p className="text-xs text-gray-500">Avg Fee</p><p className="text-lg font-bold">{analysisResult.averageFee}%</p></div></div>
            {analysisResult.gap > 0 && <div className="mb-3 p-2 bg-white dark:bg-gray-800 rounded-lg"><p className="text-sm">Gap to goal: <span className="font-bold text-red-600">{analysisResult.gap.toLocaleString()} SEK</span></p></div>}
            {analysisResult.recommendations.length > 0 && <div className="mt-3"><p className="text-sm font-medium mb-2">Recommendations:</p><ul className="space-y-2">{analysisResult.recommendations.map((r,i) => <li key={i} className="text-sm flex items-start"><span className="mr-2 text-primary-500">•</span><span>{r.text}</span></li>)}</ul></div>}</div></div></div>
        )}
      </div>
    </div>
  );
}