import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import 'bootstrap/dist/css/bootstrap.min.css';

require('dotenv').config();

ReactDOM.render(<App />, document.getElementById('root'));
