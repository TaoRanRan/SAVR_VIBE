// Required annual return calculation
export function calculateRequiredReturn(currentAmount, monthlyContribution, targetAmount, monthsRemaining) {
  if (monthsRemaining <= 0) return { requiredAnnualReturn: 0, isReachable: currentAmount >= targetAmount, riskLevel: 'N/A', message: currentAmount >= targetAmount ? "Goal already achieved!" : "Target date has passed", totalContributions: currentAmount, growthNeeded: Math.max(0, targetAmount - currentAmount), growthPercentage: 0, rawRequiredReturn: 0 };
  const totalContributions = currentAmount + monthlyContribution * monthsRemaining;
  if (totalContributions >= targetAmount) return { requiredAnnualReturn: 0, isReachable: true, riskLevel: 'Very Low', message: "Your savings alone will reach the goal. Consider reducing monthly savings or increasing your target!", totalContributions, growthNeeded: 0, growthPercentage: 0, rawRequiredReturn: 0 };
  if (monthlyContribution === 0) {
    const requiredRate = Math.pow(targetAmount / currentAmount, 1 / (monthsRemaining / 12)) - 1;
    return formatReturnResult(requiredRate * 100, currentAmount, monthlyContribution, targetAmount, monthsRemaining, totalContributions);
  }
  let low = 0, high = 0.1, requiredMonthlyRate = 0, iterations = 0, maxIterations = 100, tolerance = 1;
  while (low <= high && iterations < maxIterations) {
    const mid = (low + high) / 2;
    const fv = calculateFutureValue(currentAmount, monthlyContribution, monthsRemaining, mid);
    if (Math.abs(fv - targetAmount) < tolerance) { requiredMonthlyRate = mid; break; }
    if (fv < targetAmount) low = mid; else high = mid;
    requiredMonthlyRate = mid;
    iterations++;
    if (iterations === maxIterations - 10 && fv < targetAmount) high *= 2;
  }
  const requiredAnnualReturn = (Math.pow(1 + requiredMonthlyRate, 12) - 1) * 100;
  return formatReturnResult(requiredAnnualReturn, currentAmount, monthlyContribution, targetAmount, monthsRemaining, totalContributions);
}

function calculateFutureValue(current, monthly, months, monthlyRate) {
  let fv = current * Math.pow(1 + monthlyRate, months);
  if (monthlyRate > 0) fv += monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  else fv += monthly * months;
  return fv;
}

function formatReturnResult(annual, current, monthly, target, months, totalContributions) {
  const raw = annual;
  let riskLevel = 'Low', message = '', isReachable = true;
  if (raw > 30) { riskLevel = 'Extreme'; message = "⚠️ Required return is extremely high - this goal may not be realistic with traditional investments"; isReachable = false; }
  else if (raw > 20) { riskLevel = 'Very High'; message = "📈 Very aggressive strategy needed - consider alternative investments or adjusting your goal"; isReachable = false; }
  else if (raw > 15) { riskLevel = 'High'; message = "📊 Aggressive growth strategy needed - high risk tolerance required"; isReachable = true; }
  else if (raw > 10) { riskLevel = 'Moderate-High'; message = "🌱 Growth-focused portfolio recommended"; isReachable = true; }
  else if (raw > 7) { riskLevel = 'Moderate'; message = "💧 Balanced approach should work well"; isReachable = true; }
  else if (raw > 4) { riskLevel = 'Low-Moderate'; message = "💰 Conservative growth strategy"; isReachable = true; }
  else if (raw > 0) { riskLevel = 'Very Low'; message = "🛡️ Very conservative approach will work"; isReachable = true; }
  else { riskLevel = 'None'; message = "✓ Goal achievable with savings alone"; isReachable = true; }
  return { requiredAnnualReturn: raw.toFixed(2), rawRequiredReturn: raw, isReachable, riskLevel, message, monthlyRate: raw > 0 ? (Math.pow(1 + raw/100, 1/12) - 1).toFixed(6) : 0, totalContributions: Math.round(totalContributions), growthNeeded: Math.max(0, Math.round(target - totalContributions)), growthPercentage: ((target - totalContributions) / target * 100).toFixed(1) };
}

export function getAllocationStrategy(requiredReturn, monthsRemaining) {
  const years = Math.max(1, monthsRemaining / 12);
  const rr = parseFloat(requiredReturn) || 5;
  let stocks = years < 3 ? 20 : years < 7 ? 50 : 70;
  let bonds = years < 3 ? 50 : years < 7 ? 35 : 25;
  let cash = 100 - stocks - bonds;
  if (rr > 20) { stocks = 95; bonds = 5; cash = 0; }
  else if (rr > 15) { stocks = 85; bonds = 12; cash = 3; }
  else if (rr > 10) { stocks = 75; bonds = 20; cash = 5; }
  else if (rr > 7) { stocks = 65; bonds = 27; cash = 8; }
  else if (rr > 4) { stocks = 50; bonds = 35; cash = 15; }
  else if (rr > 0) { stocks = 35; bonds = 45; cash = 20; }
  const total = stocks + bonds + cash;
  stocks = Math.round(stocks / total * 100);
  bonds = Math.round(bonds / total * 100);
  cash = 100 - stocks - bonds;
  let desc = '';
  if (rr > 20) desc = "Extreme growth portfolio - high risk, potentially including alternative investments";
  else if (rr > 15) desc = "Aggressive growth portfolio with high equity exposure";
  else if (rr > 10) desc = "Growth-oriented portfolio with significant equity allocation";
  else if (rr > 7) desc = "Balanced growth portfolio with moderate risk";
  else if (rr > 4) desc = "Conservative balanced portfolio";
  else desc = "Income-focused conservative portfolio";
  return { stocks, bonds, cash, description: desc, yearsRemaining: years.toFixed(1) };
}

export function calculateProjectionData(current, monthly, months, requiredReturn, targetAmount) {
  const monthlyRate = Math.pow(1 + requiredReturn/100, 1/12) - 1;
  let withGrowth = current, withoutGrowth = current;
  const data = [];
  for (let i = 0; i <= months; i++) {
    data.push({ month: i, withGrowth: Math.round(withGrowth), withoutGrowth: Math.round(withoutGrowth), target: targetAmount });
    withGrowth = (withGrowth + monthly) * (1 + monthlyRate);
    withoutGrowth = withoutGrowth + monthly;
  }
  return data;
}