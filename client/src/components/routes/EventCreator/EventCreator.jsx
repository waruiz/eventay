import React from 'react';
import axios from 'axios';
import DurationFields from './DurationFields.jsx';
import FriendsTable from './FriendsTable.jsx';
import NavBar from '../NavBar.jsx';
import TimeRanges from './TimeRanges.jsx';
import BasicEventInfo from './BasicEventInfo.jsx';

import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';

export default class EventCreator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allFriends: [],
      selectedFriendIds: [],
      selectedRowIds: [],
      selectedFriendNames: [],
      recommendedTimes: [],
      selectedTimeRowId: [],
      selectedTime: ['', ''],
      durationMins: '',
      durationHrs: '',
      generatedTimes: false,
      startDate: null,
      startHours: null,
      startMinutes: null,
      startAMPM: null,
      endDate: null,
      endHours: null,
      endMinutes: null,
      endAMPM: null,
      eventName: '',
      eventDescription: '',
      eventLocation: '',
      stepIndex: 1,
      dialogOpen: false
    };
    this.getAllFriends();
    this.calculateTotalTime = this.calculateTotalTime.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handlePrev = this.handlePrev.bind(this);
    this.generateRecommendations = this.generateRecommendations.bind(this);
    this.createEvent = this.createEvent.bind(this);
    this.handleDateChanges = this.handleDateChanges.bind(this);
    this.handleDropdownChanges = this.handleDropdownChanges.bind(this);
    this.handleTextChanges = this.handleTextChanges.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.handleSelectionChange2 = this.handleSelectionChange2.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.isSelected2 = this.isSelected2.bind(this);
    this.handleRecommendationClick = this.handleRecommendationClick.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.convertTime = this.convertTime.bind(this);
  }

  convertTime(input) {
    let newDate = new Date(input);
    let splitDate = newDate.toString().split(' ');
    let day = splitDate[0];
    let month = splitDate[1];
    let date = splitDate[2];
    let year = splitDate[3];
    let dateStr = day + ' ' + month + ' ' + date + ', ' + year + ' ';

    let hours = newDate.getHours();
    let minutes = newDate.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let timeStr = hours + ':' + minutes + ' ' + ampm;
    return dateStr + timeStr;
  }

  handleNext() {
    const { stepIndex } = this.state;
    if (stepIndex < 3) {
      this.setState({
        stepIndex: stepIndex + 1
      });
    }
  }

  handlePrev() {
    const { stepIndex } = this.state;
    if (stepIndex > 0) {
      this.setState({ stepIndex: stepIndex - 1 });
    }
  }

  handleOpen() {
    this.setState({ dialogOpen: true });
  }

  handleClose() {
    this.setState({ dialogOpen: false });
  }

  handleRecommendationClick(newTime) {
    this.setState({ selectedTime: newTime });
  }

  isSelected(index) {
    return this.state.selectedRowIds.indexOf(index) !== -1;
  }

  isSelected2(index) {
    return this.state.selectedTimeRowId.indexOf(index) !== -1;
  }

  getAllFriends() {
    const ownId = JSON.parse(localStorage.getItem('userInfo')).id;
    axios
      .get(`/api/friends/${ownId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(res => {
        const friendIds = [];
        for (let idx in res.data) {
          friendIds.push([res.data[idx].id, res.data[idx].username]);
        }
        this.setState({ allFriends: friendIds });
      })
      .catch(err => console.log(err));
  }

  calculateTotalTime(dateAsMilliseconds, hours, minutes, ampm) {
    return new Date(
      dateAsMilliseconds +
        (hours % 12) * 3600000 +
        minutes * 60000 +
        ampm * 43200000
    );
  }

  generateRecommendations() {
    const start = this.calculateTotalTime(
      this.state.startDate.getTime(),
      this.state.startHours,
      this.state.startMinutes,
      this.state.startAMPM
    );
    const end = this.calculateTotalTime(
      this.state.endDate.getTime(),
      this.state.endHours,
      this.state.endMinutes,
      this.state.endAMPM
    );

    const timeRange = [[start, end]];
    const durationAsMilliseconds =
      (Number(this.state.durationHrs) * 60 + Number(this.state.durationMins)) *
      60000;
    const ownId = JSON.parse(localStorage.getItem('userInfo')).id;
    const invitees = [...this.state.selectedFriendIds, ownId];
    axios
      .post(
        '/api/schedule/showRecommendedTimes',
        {
          selectedFriendIds: invitees,
          durationAsMilliseconds: durationAsMilliseconds,
          timeRange: timeRange
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      .then(res => {
        let recommendations = [];
        for (let recommendationId in res.data) {
          recommendations.push(res.data[recommendationId]);
        }
        this.setState({ recommendedTimes: recommendations });
      })
      .catch(err => {
        console.log(err);
      });
  }

  createEvent() {
    const ownId = JSON.parse(localStorage.getItem('userInfo')).id;
    axios
      .post(
        '/api/event',
        {
          title: this.state.eventName,
          start_time: this.state.selectedTime[0],
          end_time: this.state.selectedTime[1],
          host_id: ownId
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      .then(res => {
        let newEventId = res.data[0].id;
        for (let currId of this.state.selectedFriendIds) {
          axios.post(
            '/api/attendant',
            {
              user_id: currId,
              invitor_id: ownId,
              event_id: newEventId
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
        }
      })
      .then(res => {
        this.props.history.push('/');
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleDateChanges(newDate, stateKey) {
    this.setState({ [stateKey]: newDate });
  }

  handleDropdownChanges(stateKey, value) {
    this.setState({ [stateKey]: value });
  }

  handleSelectionChange(selectedRows) {
    let updatedUserIds = [];
    let updatedFriendNames = [];
    let updatedRowIds = [];
    if (selectedRows === 'all') {
      this.state.allFriends.forEach((friend, idx) => {
        updatedUserIds.push(friend[0]);
        updatedFriendNames.push(friend[1]);
        updatedRowIds.push(idx);
      });
    } else if (selectedRows !== 'none') {
      updatedRowIds = selectedRows;
      selectedRows.forEach(row => {
        updatedUserIds.push(this.state.allFriends[row][0]);
        updatedFriendNames.push(this.state.allFriends[row][1]);
      });
    }
    this.setState({
      selectedFriendIds: updatedUserIds,
      selectedRowIds: updatedRowIds,
      selectedFriendNames: updatedFriendNames
    });
  }

  handleSelectionChange2(selectedRow, startTime, endTime) {
    let newTime = [startTime, endTime];
    this.setState({
      selectedTimeRowId: selectedRow,
      selectedTime: newTime
    });
  }

  handleTextChanges(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <BasicEventInfo
            eventName={this.state.eventName}
            eventDescription={this.state.eventDescription}
            eventLocation={this.state.eventLocation}
            handleTextChanges={this.handleTextChanges}
          />
        );
      case 1:
        return (
          <div>
            <TimeRanges
              handleDateChanges={this.handleDateChanges}
              handleDropdownChanges={this.handleDropdownChanges}
              startDate={this.state.startDate}
              startHours={this.state.startHours}
              startMinutes={this.state.startMinutes}
              startAMPM={this.state.startAMPM}
              endDate={this.state.endDate}
              endHours={this.state.endHours}
              endMinutes={this.state.endMinutes}
              endAMPM={this.state.endAMPM}
            />
            <DurationFields
              durationHrs={this.state.durationHrs}
              durationMins={this.state.durationMins}
              handleTextChanges={this.handleTextChanges}
            />
          </div>
        );
      case 2:
        return (
          <div>
            <FriendsTable
              allFriends={this.state.allFriends}
              handleSelectionChange={this.handleSelectionChange}
              isSelected={this.isSelected}
            />
          </div>
        );
      case 3:
        const actions = [
          <FlatButton label="Edit" primary={true} onClick={this.handleClose} />,
          <RaisedButton
            label="Create event!"
            primary={true}
            onClick={() => {
              this.handleClose();
              this.createEvent();
            }}
          />
        ];
        return (
          <div>
            <Table
              height="500px"
              onRowSelection={rowIds => {
                this.handleSelectionChange2(
                  rowIds,
                  this.state.recommendedTimes[rowIds][0],
                  this.state.recommendedTimes[rowIds][1]
                );
              }}
            >
              <TableHeader displaySelectAll={false}>
                <TableRow>
                  <TableHeaderColumn>Start time</TableHeaderColumn>
                  <TableHeaderColumn>End time</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody showRowHover={true} deselectOnClickaway={false}>
                {this.state.recommendedTimes &&
                  this.state.recommendedTimes.map((time, idx) => (
                    <TableRow
                      // TODO: on check, update in UI and update state
                      selected={this.isSelected2(idx)}
                      key={idx}
                    >
                      <TableRowColumn>
                        {this.convertTime(time[0])}
                      </TableRowColumn>
                      <TableRowColumn>
                        {this.convertTime(time[1])}
                      </TableRowColumn>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <Dialog
              title="Review details"
              actions={actions}
              open={this.state.dialogOpen}
              onRequestClose={this.handleClose}
            >
              <div>Event name: {this.state.eventName}</div>
              <div>Description: {this.state.eventDescription}</div>
              <div>Location: {this.state.eventLocation}</div>
              {/* TODO: reformat */}
              <div>Start time: {this.state.selectedTime[0]}</div>
              <div>End time: {this.state.selectedTime[1]}</div>
              {/* TODO: reformat */}
              <div>Invited Friends: {this.state.selectedFriendNames}</div>
            </Dialog>
          </div>
        );
      default:
        return;
    }
  }

  render() {
    console.log('state is:', this.state);
    return (
      <div>
        <NavBar history={this.props.history} />
        <h1>Create new event!</h1>
        <div style={{ width: '100%', maxWidth: 1000, margin: 'auto' }}>
          <Stepper activeStep={this.state.stepIndex}>
            <Step>
              <StepLabel>What's the occasion?</StepLabel>
            </Step>
            <Step>
              <StepLabel>Time Preferences</StepLabel>
            </Step>
            <Step>
              <StepLabel>Invite friends</StepLabel>
            </Step>
            <Step>
              <StepLabel>Select time</StepLabel>
            </Step>
          </Stepper>
          <div>
            <div>{this.getStepContent(this.state.stepIndex)}</div>
            <div style={{ margin: '3% 20% 5% 0', float: 'right' }}>
              <FlatButton
                label="Back"
                disabled={this.state.stepIndex === 0}
                onClick={this.handlePrev}
                style={{ marginRight: 12 }}
              />
              <RaisedButton
                label={this.state.stepIndex === 3 ? 'Finish' : 'Next'}
                primary={true}
                onClick={() => {
                  if (this.state.stepIndex === 2) {
                    this.generateRecommendations();
                  }
                  if (this.state.stepIndex === 3) {
                    this.handleOpen();
                  }
                  this.handleNext();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
