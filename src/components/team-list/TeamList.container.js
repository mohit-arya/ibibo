import React, { Component } from 'react'
import { TEAM_LIST_API_URL, ALL_TEAMS_VIEW, SORT_ORDER_ASC } from '../../constants';
import Database from '../../utils/db';
import TeamListComponent from './TeamList.component';

export default class TeamListContainer extends Component {

  state = {
    teamsPerPage: 10,
    currentPageNum: 1,
    teams: [],
    teamsCount: null,
    favourites: [],
    selectedView: ALL_TEAMS_VIEW,
    sortBy: null,
    sortOrder: SORT_ORDER_ASC
  }

  componentDidMount = async () => {
    const isDBPopulated = await this.isTeamListInDB();
    if (!isDBPopulated) {
      await this.fetchAndStoreTeamList();
    }
    this.getTeamsFromDb();
  }

  isTeamListInDB = async () => {
    await Database.init();
    const count = await Database.getTeamsCount();
    return count > 0;
  }

  fetchAndStoreTeamList = async () => {
    const res = await fetch(TEAM_LIST_API_URL);
    const teamList = await res.json();
    Database.insertTeams(teamList);
  }

  getTeamsFromDb = async () => {
    const { currentPageNum, teamsPerPage, sortBy, sortOrder } = this.state;
    const startIndex = teamsPerPage * (currentPageNum - 1) + 1;
    const teams = await Database.getTeams(startIndex, teamsPerPage, sortBy, sortOrder);
    const teamsCount = await Database.getTeamsCount();
    this.setState({ teams, teamsCount });
  }

  onNextClick = async () => {
    const { currentPageNum, teamsCount, teamsPerPage } = this.state;
    if (currentPageNum < teamsCount / teamsPerPage) {
      this.setState({
        currentPageNum: currentPageNum + 1
      }, () => {
        this.getTeamsFromDb();
      });
    }
  }

  onPreviousClick = async () => {
    const { currentPageNum } = this.state;
    if (currentPageNum > 1) {
      this.setState({
        currentPageNum: currentPageNum - 1
      }, () => {
        this.getTeamsFromDb();
      });
    }
  }

  toggleFavourites = (team) => {
    const { favourites } = this.state;
    let newFavourites = [...favourites];
    if (this.isFavourite(team)) {
      newFavourites = favourites.filter(t => {
        return team.team_id !== t.team_id;
      });
    } else {
      newFavourites.push(team);
    }
    this.setState({
      favourites: newFavourites
    });
  }

  isFavourite = (team) => {
    return this.state.favourites.some(t => {
      return team.team_id === t.team_id;
    });
  }

  onViewSwitch = (view) => {
    this.setState({
      selectedView: view
    });
  }

  getTableData = () => {
    const { selectedView, teams, favourites } = this.state;
    return selectedView === ALL_TEAMS_VIEW ? teams : favourites;
  }

  onSortSelection = (sortBy, sortOrder) => {
    this.setState({
      sortBy,
      sortOrder,
      currentPageNum: 1
    }, () => {
      this.getTeamsFromDb();
    })
  }

  render() {
    return <TeamListComponent
      teams={this.getTableData()}
      onNextClick={this.onNextClick}
      onPreviousClick={this.onPreviousClick}
      isFavourite={this.isFavourite}
      toggleFavourites={this.toggleFavourites}
      onViewSwitch={this.onViewSwitch}
      onSortSelection={this.onSortSelection}
      selectedView={this.state.selectedView}
    />;
  }
}
