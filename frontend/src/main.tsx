import React from 'react'
import ReactDOM from 'react-dom'
import './App.css'
import App from './App'
import BattleshipGame from './components/BattleshipGame';



ReactDOM.render(
  <React.StrictMode>
    <BattleshipGame />
  </React.StrictMode>,
  document.getElementById('root')
)
