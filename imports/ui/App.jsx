import React from 'react';
import Hello from './components/Hello.jsx';
import Info from './components/Info.jsx';
import Login from './components/Login.jsx';
import JobStageCategory from './components/JobStageCategory.jsx';
import JobStageCategoryDropDown from './components/JobStageCategoryDropDown.jsx';
import AddJobPopup from './components/AddJobPopup.jsx';
import AddJobForm from './components/AddJobForm.jsx';
import JobPostings from './components/JobPostings.jsx';
import JobCard from './components/JobCard.jsx';
import uuid from 'uuid';
import ButtonClass from './components/ButtonClass.jsx';
import NavBar from './components/NavBar';
import DashboardPage from './components/DashboardPage';
import MapPage from './components/MapPage';
import CalendarPage from './components/CalendarPage';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
// import '../../../client/main.css';


export default class App extends React.Component {
  state = {
    postings : [
        {id: uuid.v4(), title: "Software Engineering Co-op", company: "Amazon", status: "Wishlist"},
        {id: uuid.v4(), title: "Full Stack Developer Co-op", company: "IBM", status: "Wishlist"},
        {id: uuid.v4(), title: "Front End Developer Co-op", company: "Google", status: "Wishlist"},
        {id: uuid.v4(), title: "Analytics Developer Co-op", company: "SAP", status: "Wishlist"}
    ]
  };

  render() {
    console.log(this.state.postings);
    return(
      <BrowserRouter>
        <NavBar />
        <div className="app">
          <Switch>
            <Route exact path='/' component={DashboardPage} />
            <Route path='/map' component ={MapPage} />
            <Route path='/calendar' component={CalendarPage} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}