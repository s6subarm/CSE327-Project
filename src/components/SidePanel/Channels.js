import React, { Component } from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import { Menu, Icon, Modal, Form, Input, Button } from "semantic-ui-react";

class Channels extends Component {
  state = {
    activeChannel: "",
    user: this.props.currentUser,
    channel: null,
    channels: [],
    channelName: "",
    channelDetails: "",
    channelsRef: firebase.database().ref("channels"),
    messagesRef: firebase.database().ref('messages'),
    notifications: [],
    modal: false,
    firstLoad: true
  };
  componentDidMount() {
    this.addListeners();
  }
  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = () => {
    let loadChannels = [];
    this.state.channelsRef.on("child_added", snap => {
      loadChannels.push(snap.val());
      this.setState({ channels: loadChannels }, () => this.setFirstChannel());
      this.addNotificationListener(snap.key);
    });
  };

  addNotificationListener = channelId =>{
    this.state.messagesRef.child(channelId).on('value', snap =>{
      if (this.state.channel){
        this.handleNotiications(channelId, this.state.channel.id, this.state.notifications, snap );
      }
    })
  }

  handleNotiications = ( channelId, currentChannelId, notifications, snap) =>{
    let lastTotal = 0;

    let index = notifications.findIndex(notifications=> notifications.id === channelId);

    if (index !== -1){
      if (channelId !== currentChannelId){
        lastTotal = notifications[index].total;

        if (snap.numChildren() - lastTotal > 0){
          notifications[index].count = snap.numChildren() - lastTotal;
        }
      }
      notifications[index].lastknowntotal = snap.numChildren();
    }else{
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        count : 0
      });
    }
    this.setState({  notifications  });
  }


  removeListeners = () => {
    this.state.channelsRef.off();
  };

  setFirstChannel = () => {
    const firstChannel = this.state.channels[0];
    if (this.state.firstLoad && this.state.channels.length > 0) {
      this.props.setCurrentChannel(firstChannel);
      this.setActiveChannel(firstChannel);
    }
    this.setState({ firstLoad: false });
  };

  addChannel = () => {
    const { channelsRef, channelName, channelDetails, user } = this.state;

    const key = channelsRef.push().key;

    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL
      }
    };

    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({ channelName: "", channelDetails: "" });
        this.closeModal();
        console.log("Chanel Added");
      })
      .catch(err => {
        console.error(err);
      });
  };

  submitHandler = event => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.addChannel();
    }
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };
  isFormValid = ({ channelName, channelDetails }) =>
    channelName && channelDetails;

  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });

  displayChannels = channels =>
    channels.length > 0 &&
    channels.map(channel => (
      <Menu.Item
        key={channel.id}
        name={channel.name}
        onClick={() => this.changeChannel(channel)}
        style={{ opacity: 2 }}
        active={channel.id === this.state.activeChannel}
      >
        # {channel.name}
      </Menu.Item>
    ));
  changeChannel = channel => {
    this.setActiveChannel(channel);
    this.clearNotifications();
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
    this.setState({ channel });
  };

  clearNotifications = () => {
    let index = this.state.notifications.findIndex( notification => notification.id ===
    this.state.channel.id);

    if (index !== -1) {
      let updatedNotificatiions = [...this.state.notifications];
      updatedNotificatiions[index].total = this.state.notifications[index].lastKnowntotal;
      updatedNotificatiions[index].count = 0;
      this.setState({ notifications : updatedNotificatiions }) 
    }
  }
  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };

  render() {
    const { channels, modal } = this.state;

    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="group" /> GROUPS{" "}
            </span>
            ({channels.length})<Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          <div className="channels">
            {/* display Groups */}
            {this.displayChannels(channels)}
          </div>
        </Menu.Menu>
        {/* add channel modal */}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.submitHandler}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of Channel"
                  name="channelName"
                  onChange={this.handleChange}
                />
              </Form.Field>

              <Form.Field>
                <Input
                  fluid
                  label="About the Channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.submitHandler}>
              <Icon name="check" /> Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}
export default connect(
  null,
  { setCurrentChannel, setPrivateChannel }
)(Channels);
