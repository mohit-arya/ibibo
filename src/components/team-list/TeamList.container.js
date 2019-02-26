import React, { Component } from 'react'
import { TEAM_LIST_API_URL, ALL_TEAMS_VIEW, SORT_ORDER_ASC } from '../../constants';
import Database from '../../utils/db';
import TeamListComponent from './TeamList.component';

export default class TeamListContainer extends Component {

  state = {
    teamsPerPage: 10,
    currentPageNum: 1,
    teams: [],
    teamsCount: 0,
    favourites: [],
    selectedView: ALL_TEAMS_VIEW,
    sortBy: null,
    sortOrder: SORT_ORDER_ASC
  }

  componentDidMount = async () => {
    await Database.init();
    const isDBPopulated = await this.isTeamListInDB();
    if (!isDBPopulated) {
      await this.fetchAndStoreTeamList();
    }
    this.updateComponentState();
  }

  isTeamListInDB = async () => {
    const count = await Database.getTeamsCount();
    return count > 0;
  }

  fetchAndStoreTeamList = async () => {
    const res = await fetch(TEAM_LIST_API_URL);
    const teamList = await res.json();
    await Database.insertTeams(teamList);
  }

  getTeamsFromDb = async () => {
    const { currentPageNum, teamsPerPage, sortBy, sortOrder } = this.state;
    const startIndex = teamsPerPage * (currentPageNum - 1) + 1;
    const teams = await Database.getTeams(startIndex, teamsPerPage, sortBy, sortOrder);
    return teams;
  }

  onNextClick = async () => {
    const { currentPageNum, teamsCount, teamsPerPage } = this.state;
    if (currentPageNum < teamsCount / teamsPerPage) {
      this.setState({
        currentPageNum: currentPageNum + 1
      }, () => {
        this.updateComponentState();
      });
    }
  }

  onPreviousClick = async () => {
    const { currentPageNum } = this.state;
    if (currentPageNum > 1) {
      this.setState({
        currentPageNum: currentPageNum - 1
      }, () => {
        this.updateComponentState();
      });
    }
  }

  updateComponentState = async () => {
    const teamsCount = await Database.getTeamsCount();
    const teams = await this.getTeamsFromDb();
    this.setState({ teams, teamsCount });
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
      this.updateComponentState();
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
