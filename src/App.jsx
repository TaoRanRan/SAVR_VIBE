import React, { useState } from 'react';
import { Target, TrendingUp, PieChart, Bell, Moon, Sun, Briefcase } from 'lucide-react';
import GoalForm from './components/GoalForm';
import GoalProgress from './components/GoalProgress';
import FundRecommendations from './components/FundRecommendations';
import PortfolioInput from './components/PortfolioInput';
import { calculateRequiredReturn } from './utils/financialCalculations';

function App() {
  const [goal, setGoal] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState(null);

  const handleSetGoal = (goalData) => {
    setGoal(goalData);
    setPortfolioAnalysis(null);
    setShowPortfolio(false);
  };

  const getMonthsRemaining = () => {
    if (!goal) return 0;
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    return Math.max(1,
      (targetDate.getFullYear() - today.getFullYear()) * 12 +
      (targetDate.getMonth() - today.getMonth())
    );
  };

  const currentAmount = 0; // No manual savings

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg blur opacity-60 animate-pulse"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-lg p-2">
                  <Target className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                SAVR Goals
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <PieChart className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Bell className="h-5 w-5" />
              </button>
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                JD
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!goal ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-slide-in">
              <div className="inline-flex items-center justify-center p-2 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
                <span className="px-3 py-1 text-sm font-medium text-primary-700 dark:text-primary-300">
                  🎯 Smart Goal Setting
                </span>
              </div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                What are you saving for?
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Set your financial goals and get personalized investment strategies tailored just for you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: Target, title: 'Set Goals', desc: 'Define your target amount and timeline' },
                { icon: TrendingUp, title: 'Track Progress', desc: 'Watch your savings grow in real-time' },
                { icon: PieChart, title: 'Smart Portfolios', desc: 'Get AI-powered fund recommendations' },
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="bg-primary-100 dark:bg-primary-900/30 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
                  </div>
                );
              })}
            </div>

            <GoalForm onSetGoal={handleSetGoal} />
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{goal.name || 'Your Goal Dashboard'}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{goal.categoryLabel} goal</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowPortfolio(!showPortfolio)}
                  className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors flex items-center space-x-2"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>{showPortfolio ? 'Hide Portfolio Analysis' : 'Analyze My Portfolio'}</span>
                </button>
                <button
                  onClick={() => setGoal(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Set New Goal
                </button>
              </div>
            </div>

            {showPortfolio && (
              <div className="mb-8">
                <PortfolioInput
                  onAnalyze={setPortfolioAnalysis}
                  currentPortfolio={[]}
                  goal={goal}
                  monthsRemaining={getMonthsRemaining()}
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GoalProgress
                  goal={goal}
                  currentAmount={currentAmount}
                  portfolioAnalysis={portfolioAnalysis}
                />
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <div className="w-1 h-6 bg-primary-500 rounded-full mr-3"></div>
                    Quick Summary
                  </h3>
                  {(() => {
                    const monthsRemaining = getMonthsRemaining();
                    const requiredReturnData = calculateRequiredReturn(
                      currentAmount,
                      goal.monthlySavings,
                      goal.targetAmount,
                      monthsRemaining
                    );
                    return (
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Target Date</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {new Date(goal.targetDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                            })}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Time Remaining</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {monthsRemaining} months
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Required Return</p>
                          <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                            {requiredReturnData.requiredAnnualReturn}%
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl p-4 text-white">
                          <p className="text-sm opacity-90">Monthly Savings</p>
                          <p className="text-2xl font-bold">{goal.monthlySavings?.toLocaleString()} SEK</p>
                          <p className="text-xs opacity-75 mt-1">Your plan</p>
                        </div>

                        {portfolioAnalysis && (
                          <div className={`mt-4 p-3 rounded-lg ${
                            portfolioAnalysis.isOnTrack
                              ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                              : 'bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800'
                          }`}>
                            <p className="text-xs font-medium mb-1">Portfolio Status</p>
                            <p className="text-sm font-semibold">
                              {portfolioAnalysis.isOnTrack
                                ? '✓ On track with current portfolio'
                                : `⚠️ Need ${portfolioAnalysis.requiredReturn}% vs ${portfolioAnalysis.portfolioReturn}% actual`}
                            </p>
                            <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                              Projected: {portfolioAnalysis.projectedValue?.toLocaleString()} SEK
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            <FundRecommendations
              goal={goal}
              monthlyAmount={goal.monthlySavings}
              currentAmount={currentAmount}
              monthsRemaining={getMonthsRemaining()}
              targetAmount={goal.targetAmount}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;