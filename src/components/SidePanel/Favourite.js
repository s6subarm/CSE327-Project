import React, { Component } from "react";
import firebase from "../../firebase";
import { Menu, Icon } from "semantic-ui-react";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
class Favourite extends Component {
  state = {
    user: this.props.currentUser,
    usersRef: firebase.database().ref("user"),
    activeChannel: "",
    favChannels: []
  };
  componentDidMount() {
    if (this.state.user) {
      this.addListeners(this.state.user.uid);
    }
  }

  componentWillUnmount() {
    this.removeListener();
  }

  removeListener = () => {
    this.state.usersRef.child(`${this.state.user.uid}/favourite`).off();
  }

  addListeners = userId => {
    this.state.usersRef
      .child(userId)
      .child("favourite")
      .on("child_added", snap => {
        const favChannel = { id: snap.key, ...snap.val() };
        this.setState({ favChannels: [...this.state.favChannels, favChannel] });
      });

    this.state.usersRef
      .child(userId)
      .child("favourite")
      .on("child_removed", snap => {
        const ChannelToRemove = { id: snap.key, ...snap.val() };
        const fillterChannels = this.state.favChannels.filter(channel => {
          return channel.id !== ChannelToRemove.id;
        });
        this.setState({ favChannels: fillterChannels });
      });
  };
  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };
  changeChannel = channel => {
    this.setActiveChannel(channel);
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
  };
  displayChannels = favChannels =>
    favChannels.length > 0 &&
    favChannels.map(channel => (
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
  render() {
    const { favChannels } = this.state;
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="star outline" /> Favourite{" "}
          </span>
          ({favChannels.length})
        </Menu.Item>
        <div className="channels">
          {/* display Groups */}
          {this.displayChannels(favChannels)}
        </div>
      </Menu.Menu>
    );
  }
}

export default connect(
  null,
  { setCurrentChannel, setPrivateChannel }
)(Favourite);
