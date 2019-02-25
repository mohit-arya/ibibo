import React, { Component } from 'react'
import './TeamList.component.css';
import { DUMMY_LOGO_URL, ALL_TEAMS_VIEW, FAVOURITES_VIEW, SORT_BY_NAME, SORT_ORDER_ASC, SORT_BY_WINS, SORT_ORDER_DESC } from '../../constants';

export default class TeamListComponent extends Component {

  getViewSwitcher = () => {
    return (
      <div className="float-left">
        <button onClick={() => { this.props.onViewSwitch(ALL_TEAMS_VIEW) }} className="btn btn-default">All Teams</button>
        <button onClick={() => { this.props.onViewSwitch(FAVOURITES_VIEW) }} className="btn btn-default">My Favourites</button>
      </div>
    );
  }

  getSortOptions = () => {
    return (
      <div className="sort-options-container float-right">
        <span className="sort-by">Sort By </span>
        <button onClick={() => this.props.onSortSelection(SORT_BY_NAME, SORT_ORDER_ASC)} className="btn btn-default">Name</button>
        <button onClick={() => this.props.onSortSelection(SORT_BY_WINS, SORT_ORDER_DESC)} className="btn btn-default">Wins</button>
      </div>
    )
  }

  getTableHeader = () => {
    return (
      <thead>
        <tr>
          <th>Logo</th>
          <th>Name</th>
          <th>Wins</th>
          <th>Losses</th>
          <th>Favourite</th>
        </tr>
      </thead>
    );
  }

  getTableBody = () => {
    const blackStar = '★';
    const whiteStar = '☆';
    return this.props.teams.map(team => {
      return (
        <tr key={team.team_id}>
          <td>
            <img alt={team.name} onError={this.handleImgError} className="team-logo img-responsive" src={team.logo_url} />
          </td>
          <td>{team.name}</td>
          <td>{team.wins}</td>
          <td>{team.losses}</td>
          <td>
            <span onClick={() => this.props.toggleFavourites(team)} className="star-container">
              {this.props.isFavourite(team) ? blackStar : whiteStar}
            </span>
          </td>
        </tr>
      );
    })
  }

  getPaginationControls = () => {
    return (
      <div className="pagination-controls-container float-right">
        <button onClick={this.props.onPreviousClick} className="btn btn-info">Previous</button>
        <button onClick={this.props.onNextClick} className="btn btn-info">Next</button>
      </div>
    );
  }

  handleImgError = (e) => {
    e.target.src = DUMMY_LOGO_URL;
  }

  render() {
    const { selectedView } = this.props;
    return (
      <div>
        {this.getViewSwitcher()}
        {this.getSortOptions()}
        <table className="table table-striped">
          {this.getTableHeader()}
          <tbody>
            {this.getTableBody()}
          </tbody>
        </table>
        {selectedView === ALL_TEAMS_VIEW ? this.getPaginationControls() : null}
      </div>
    )
  }
}
