import React, { Component } from 'react';
import TeamListContainer from './components/team-list/TeamList.container';

class App extends Component {
  render() {
    return (
      <div className="container">
        <TeamListContainer />
      </div>
    );
  }
}

export default App;
