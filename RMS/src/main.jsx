import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx'
import { Provider } from 'react-redux';
import { store } from './State/store';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
 
  <Provider store={store}>
    <App />
  </Provider>

  </BrowserRouter>
)
