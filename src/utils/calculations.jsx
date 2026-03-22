const fundDatabase = {
  retirement: [
    { name: 'Global Equity Fund', risk: 'Moderate', type: 'Global Stock', fee: 0.39, desc: 'Broad global exposure', color: 'from-blue-500 to-cyan-500', allocation: 50 },
    { name: 'Target Date 2045', risk: 'Moderate', type: 'Retirement Fund', fee: 0.29, desc: 'Auto-adjusting portfolio', color: 'from-purple-500 to-pink-500', allocation: 30 },
    { name: 'Bond Income Fund', risk: 'Low', type: 'Fixed Income', fee: 0.19, desc: 'Stable income', color: 'from-green-500 to-emerald-500', allocation: 20 },
  ],
  house: [
    { name: 'Sweden Index Fund', risk: 'Low', type: 'Swedish Stocks', fee: 0.19, desc: 'Track Swedish market', color: 'from-blue-500 to-cyan-500', allocation: 40 },
    { name: 'Global Stable Growth', risk: 'Low', type: 'Global Balanced', fee: 0.27, desc: 'Conservative global', color: 'from-green-500 to-emerald-500', allocation: 40 },
    { name: 'Short-Term Bond Fund', risk: 'Very Low', type: 'Bonds', fee: 0.15, desc: 'Capital preservation', color: 'from-yellow-500 to-orange-500', allocation: 20 },
  ],
  education: [
    { name: 'Global Growth Fund', risk: 'Moderate', type: 'Global Stocks', fee: 0.32, desc: 'Long-term growth', color: 'from-blue-500 to-cyan-500', allocation: 50 },
    { name: 'US Tech Leaders', risk: 'High', type: 'Sector Fund', fee: 0.45, desc: 'Tech focus', color: 'from-purple-500 to-pink-500', allocation: 30 },
    { name: 'Emerging Markets', risk: 'High', type: 'Emerging Markets', fee: 0.52, desc: 'High growth', color: 'from-orange-500 to-red-500', allocation: 20 },
  ],
  default: [
    { name: 'Global Index Fund', risk: 'Moderate', type: 'Global Stocks', fee: 0.22, desc: 'Broad exposure', color: 'from-blue-500 to-cyan-500', allocation: 50 },
    { name: 'Swedish Quality Fund', risk: 'Moderate', type: 'Swedish Stocks', fee: 0.34, desc: 'Quality companies', color: 'from-purple-500 to-pink-500', allocation: 30 },
    { name: 'Global Bond Fund', risk: 'Low', type: 'Fixed Income', fee: 0.18, desc: 'Stability', color: 'from-green-500 to-emerald-500', allocation: 20 },
  ]
};

export function calculateGoalProgress(goal, savings) {
  const totalSaved = savings.reduce((sum, s) => sum + s.amount, 0);
  const targetDate = new Date(goal.targetDate);
  const today = new Date();
  
  const totalMonths = (targetDate.getFullYear() - today.getFullYear()) * 12 + 
                      (targetDate.getMonth() - today.getMonth());
  
  const remaining = goal.targetAmount - totalSaved;
  const requiredMonthly = remaining / Math.max(totalMonths, 1);

  return {
    totalSaved,
    remaining,
    progress: (totalSaved / goal.targetAmount) * 100,
    monthsRemaining: Math.max(0, totalMonths),
    requiredMonthly: Math.max(0, Math.ceil(requiredMonthly))
  };
}

export function getRecommendedFunds(goal) {
  return fundDatabase[goal.type] || fundDatabase.default;
}

export function calculateProjection(initialAmount, monthlyAmount, months, annualReturn = 0.07) {
  const monthlyReturn = annualReturn / 12;
  let projection = [];
  let current = initialAmount;

  for (let i = 0; i <= months; i++) {
    projection.push({
      month: i,
      value: Math.round(current)
    });
    current = (current + monthlyAmount) * (1 + monthlyReturn);
  }

  return projection;
}