import React from 'react';
import { connect } from 'react-redux';
import { TabContent, TabPane, Nav, NavItem, NavLink, Button, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import { editJob } from '../actions/index';
import classnames from 'classnames';

import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import FileUploadJobForm from './files/FileUploadJobForm.jsx';
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
      durationPhoneInterview: this.props.job.phoneInterview.durationPhoneInterview,
      durationOnSiteInterview: this.props.job.onSiteInterview.durationOnSiteInterview,
      phoneInterview: this.props.job.phoneInterview.start,
      onSiteInterview: this.props.job.onSiteInterview.start,
      suggestions: [],
      selectedSuggestion: null,
    };
  }

  async componentDidMount() {
    try {
      let response = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=:${this.state.company}`, {
          method: "GET"
      });
      let suggestions = await response.json();
      await this.setState({ suggestions });

    } catch(e) {
        console.log(e);
    }
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
  //END TIME LOGIC FOR PHONE INT:
  var newEndPhoneInterview = new Date(this.state.phoneInterview);
  var minutesPhoneInterview = 60 * this.state.durationPhoneInterview;
  newEndPhoneInterview.setMinutes(newEndPhoneInterview.getMinutes() + minutesPhoneInterview);
  job["phoneInterview"]["end"] = newEndPhoneInterview;
  job["phoneInterview"]["durationPhoneInterview"] = this.state.durationPhoneInterview;


  job["onSiteInterview"]["start"] = this.state.onSiteInterview;
  // END TIME LOGIC FOR ON SITE INT:
  var newEndOnSiteInterview = new Date(this.state.onSiteInterview);
  var minutesOnSiteInterview = 60 * this.state.durationOnSiteInterview;
  newEndOnSiteInterview.setMinutes(newEndOnSiteInterview.getMinutes() + minutesOnSiteInterview);
  job["onSiteInterview"]["end"] = newEndOnSiteInterview;
  job["onSiteInterview"]["durationOnSiteInterview"] = this.state.durationOnSiteInterview;

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

renderTimeIntervals() {
  let options  = [];

  for(let i = 0.5; i <= 8; i = i + 0.5) {
    options.push(<option key={i} value={i}>{i}</option>);
  }
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
              
              <FormGroup className="form-date">
                <Row>
                  <Col xs="8" sm="8">
                    <Label>Phone Interview</Label>
                  </Col>
                  <Col xs="4" sm="4">
                    <Label>Duration (Hours)</Label>
                  </Col>
                </Row>

                <Row>
                  <Col xs="8" sm="8">
                    <DatePicker 
                      className="form-control date-picker"
                      name="phoneInterview"
                      autoComplete="off"
                      selected={this.state.phoneInterview}
                      onChange={this.onChangePhoneInterview} 
                      value={this.state.phoneInterview}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={30}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      timeCaption="Time"
                    />
                  </Col>
                  <Col xs="4" sm="4">
                    <Input required 
                      type="select" 
                      name="durationPhoneInterview" 
                      id="durationPhoneInterview" 
                      value={this.state.durationPhoneInterview} 
                      onChange={this.onChangeText} >
                        { this.renderTimeIntervals() }
                    </Input>
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup className="form-date">
                <Row>
                  <Col xs="8" sm="8">
                    <Label>On Site Interview</Label>
                  </Col>
                  <Col xs="4" sm="4">
                    <Label>Duration (Hours)</Label>
                  </Col>
                </Row>

                <Row>
                  <Col xs="8" sm="8">
                    <DatePicker 
                      className="form-control date-picker"
                      name="onSiteInterview" 
                      autoComplete="off"
                      selected={this.state.onSiteInterview}
                      onChange={this.onChangeOnSiteInterview} 
                      value={this.state.onSiteInterview} 
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={30}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      timeCaption="Time"
                    />
                  </Col>
                  <Col xs="4" sm="4">
                    <Input required 
                      type="select" 
                      name="durationOnSiteInterview" 
                      id="durationOnSiteInterview" 
                      value={this.state.durationOnSiteInterview} 
                      onChange={this.onChangeText} >
                        { this.renderTimeIntervals() }
                    </Input>
                  </Col>
                </Row>
              </FormGroup>

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