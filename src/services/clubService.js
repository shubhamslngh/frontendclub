import apiClient from '@/utiils/api';

export const clubService = {
  // 1. Authentication
  login: async (username, password) => {
    // Note: Adjust the endpoint if your token-auth path is different
    const response = await apiClient.post('/api-token-auth/', { username, password });
    return response.data; // Expected { token: "..." }
  },

  // 2. Players
  getPlayers: () => apiClient.get('api/players/'),
  createPlayer: (data) => apiClient.post('api/players/', data),
  updatePlayer: (id, data) => apiClient.put(`api/players/${id}/`, data),
  deletePlayer: (id) => apiClient.delete(`api/players/${id}/`),
  // 3. Teams
  getTeams: () => apiClient.get('api/teams/'),
  createTeam: (data) => apiClient.post('api/teams/', data),
  updateTeam: (id, data) => apiClient.put(`api/teams/${id}/`, data),
  deleteTeam: (id) => apiClient.delete(`api/teams/${id}/`), 
  // 4. Matches
  getMatches: () => apiClient.get('api/matches/'),
  scheduleMatch: (data) => apiClient.post('api/matches/', data),
createMatch: (data) => apiClient.post('api/matches/', data),
updateMatch: (id, data) => apiClient.put(`api/matches/${id}/`, data),
deleteMatch: (id) => apiClient.delete(`api/matches/${id}/`),
getGrounds: () => apiClient.get('api/grounds/'),
updateGround: (id, data) => apiClient.put(`api/grounds/${id}/`, data),
newGround: (data) => apiClient.post('api/grounds/', data),
deleteGround: (id) => apiClient.delete(`api/grounds/${id}/`),
//inventory
getInventory: () => apiClient.get('api/inventory-items/'),
createInventoryItem: (data) => apiClient.post('api/inventory-items/', data),
updateInventoryItem: (id, data) => apiClient.put(`api/inventory-items/${id}/`, data),
deleteInventoryItem: (id) => apiClient.delete(`api/inventory-items/${id}/`),
  // 5. Transactions (Financials)
  getTransactions: () => apiClient.get('api/transactions/'),


  recordTransaction: (data) => apiClient.post('api/transactions/', data),
  // 6. Inventory
  getInventory: () => apiClient.get('api/inventory-items/'),
  recordSale: (data) => apiClient.post('api/sales/', data),
}; 
export default clubService;