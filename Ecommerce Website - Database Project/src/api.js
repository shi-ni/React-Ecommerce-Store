import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000' // Your backend URL
});

export const getData = () => API.get('/api/data');