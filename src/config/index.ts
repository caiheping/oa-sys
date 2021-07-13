export const baseUrl = import.meta.env.MODE === 'development' ? '/api' : '/api/v1'

export const imageUrl = import.meta.env.MODE === 'development' ? '/img_url' : ''