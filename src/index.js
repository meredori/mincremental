import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import './scss/main.scss';
import IncrementingCounter from './modules/counter/counter.jsx';

ReactDOM.render(<IncrementingCounter name="me" />,document.getElementById("main"));