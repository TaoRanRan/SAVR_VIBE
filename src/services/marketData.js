// This would eventually connect to a real API
export const fetchHistoricalReturns = async (symbol, period) => {
  // Mock implementation
  return {
    '1y': 10.5,
    '3y': 8.2,
    '5y': 9.1
  };
};

export const searchAssets = async (query) => {
  // Mock search
  const mockAssets = [
    { symbol: 'SWE-IDX', name: 'Sweden Index Fund', type: 'fund' },
    { symbol: 'GLB-IDX', name: 'Global Index Fund', type: 'fund' },
    { symbol: 'VOLV-B', name: 'Volvo B', type: 'stock' },
    // etc.
  ];
  
  return mockAssets.filter(a => 
    a.name.toLowerCase().includes(query.toLowerCase())
  );
};