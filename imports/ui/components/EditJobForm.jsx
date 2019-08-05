import React from 'react';
import { connect } from 'react-redux';
import uuid from 'uuid';
import { TabContent, TabPane, Nav, NavItem, NavLink, Button, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import { editJob } from '../actions/index';
import classnames from 'classnames';

import CompanySuggestion from './CompanySuggestion';
import DateTimePicker from 'react-datetime-picker';

import FileUploadJobForm from './files/FileUploadJobForm.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import InputWithLogo from './InputWithLogo.jsx';
import SearchAutocomplete from './SearchAutocomplete.jsx';

class EditJobForm extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      activeTab: '1',
      _id: this.props.job._id,
      company: this.props.job.company,
      title: this.props.job.title,
      select: this.props.stage._id,
      phoneInterview: this.props.job.phoneInterview.start,
      onSiteInterview: this.props.job.onSiteInterview.start,
      suggestions: [],
      selectedSuggestion: null,
    };
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

onChangeText = async (e) => {
  await this.setState({ [e.target.name]: e.target.value });
}

onChangePhoneInterview = (phoneInterview) => this.setState({ phoneInterview });
onChangeOnSiteInterview = (onSiteInterview) => this.setState({ onSiteInterview });

onChangeCompanyName = async (e) => {
  try {
    await this.onChangeText(e);

    let response = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=:${this.state.company}`, {
        method: "GET"
    });
    let suggestions = await response.json();
    await this.setState({ suggestions, selectedSuggestion: null });

  } catch(e) {
      console.log(e);
  }
}


// Adds a job if one did not exist, otherwise edits existing job
onSubmit = (e) => {
  e.preventDefault();
  let job = this.props.job;
  this.updateJob(job);
  this.props.toggle();
}

updateJob = (job) => {
  job["company"] = this.state.company;
  job["title"] = this.state.title;
  job["phoneInterview"]["start"] = this.state.phoneInterview;
  job["phoneInterview"]["end"] = this.state.phoneInterview;
  job["onSiteInterview"]["start"] = this.state.onSiteInterview;
  job["onSiteInterview"]["end"] = this.state.onSiteInterview;

  if(this.state.selectedSuggestion) {
    job["domain"] = this.state.selectedSuggestion.domain;
    job["logo"] = this.state.selectedSuggestion.logo;
  }

  this.props.editJob(job, this.props.stage._id, this.state.select, this.props.jobIndex);
}

async selectSuggestion(suggestion) {
  await this.setState({selectedSuggestion: suggestion, company: suggestion.name});
}

renderOptions() {
  let stagesIds = this.props.stages.allIds;
  let stages = [];
  for(let id of stagesIds) {
    stages.push(
      {
        _id: id,
        title: this.props.stages.byId[id].title,
      });
  }

  let options = stages.map(stage => {
    return(<option key={stage._id} value={stage._id}>{stage.title}</option>)              
  });

  return options;
}

render() {
  return (
    <div> 
      <Nav tabs>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === '1' })}
            onClick={() => { this.toggle('1'); }}
          >
            Details
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === '2' })}
            onClick={() => { this.toggle('2'); }}
          >
            Documents
          </NavLink>
        </NavItem>
      </Nav>

      <TabContent activeTab={this.state.activeTab} className="content">
          <TabPane tabId="1">
            <Form onSubmit={this.onSubmit}>
              <FormGroup className="suggestions-container">
                <Label for="companyName">Company Name</Label>
                  <SearchAutocomplete
                      name="company"
                      id="companyName" 
                      placeholder="Company Name" 
                      icon={ faSearch }
                      value={ this.state.company }
                      onChange={ (e) => this.onChangeCompanyName(e) }
                      suggestions = { this.state.suggestions }
                      selection={ this.state.selectedSuggestion } 
                      selectSuggestion = { (suggestion) => this.selectSuggestion(suggestion) }
                  />
              </FormGroup>

              <FormGroup>
                  <Label for="jobTitle">Job Title</Label>
                  <InputWithLogo 
                      name="title" 
                      id="jobTitle" 
                      placeholder="Job Title" 
                      icon={ faBriefcase } 
                      selection={ this.state.selectSuggestion }
                      value={ this.state.title }
                      onChange={ (e) => this.onChangeText(e)} />
              </FormGroup>

              <FormGroup>
              <Label for="jobStageSelect">Stage</Label>
              <Input required type="select" name="select" id="jobStageSelect" value={this.state.select} onChange={this.onChangeText} >
                  { this.renderOptions() }
              </Input>
              </FormGroup>
        
              <Row>
              <Col xs="4" sm="4">Phone Interview: </Col>
              <Col xs="4" sm="4">
                  <DateTimePicker name="phoneInterview" onChange={this.onChangePhoneInterview} value={this.state.phoneInterview}/>
              </Col>
              
              </Row>
              
              <br></br>
              
              <Row>
              <Col xs="4" sm="4">On Site Interview: </Col>
              <Col xs="4" sm="4">
                  <DateTimePicker name="onSiteInterview" onChange={this.onChangeOnSiteInterview} value={this.state.onSiteInterview} /></Col>
              </Row>

              <div className="button">
                <Button>Submit</Button>
              </div>
            </Form>
          </TabPane>

          <TabPane tabId="2">
            <FileUploadJobForm jobId={this.state._id}/>
          </TabPane>

        </TabContent>
    </div>);
  } 
}

const mapStateToProps = (state) => {
  return { jobs: state.jobs.jobs, stages: state.jobs.stages }
}

export default connect(mapStateToProps, {editJob})(EditJobForm);