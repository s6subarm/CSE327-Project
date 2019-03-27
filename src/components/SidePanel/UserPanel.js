import React, { Component } from "react";
import firebase from "../../firebase";
import { Grid, Header, Icon, Dropdown, Image } from "semantic-ui-react";

class UserPanel extends Component {
  state = {
    user: this.props.currentUser
  };
  dropdownOptions = () => [
    {
      key: "user",
      text: (
        <span>
          Signed in as <strong> {this.state.user.displayName} </strong>
        </span>
      ),
      disabled: true
    },
    {
      key: "avatar",
      text: <span> Change Avatar </span>
    },
    {
      key: "signout",
      text: <span onClick={this.signoutHandler}> Sign Out </span>
    }
  ];

  signoutHandler = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log("Signed out");
      });
  };

  render() {
    return (
      <Grid style={{ background: "#4c3c4c" }}>
        <Grid.Column>
          <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
            {/* app Header */}
            <Header inverted floated="left" as="h3">
              <Icon name="facebook messenger" />
              <Header.Content> React- Chat - App </Header.Content>
            </Header>
            {/* user dropdown */}
            <Header style={{ padding: "2.25em" }} as="h4" inverted>
              <Dropdown
                trigger={
                  <span>
                    <Image
                      src={this.state.user.photoURL}
                      spaced="right"
                      avatar
                    />
                    {this.state.user.displayName}{" "}
                  </span>
                }
                options={this.dropdownOptions()}
              />
            </Header>
          </Grid.Row>
        </Grid.Column>
      </Grid>
    );
  }
}
export default UserPanel;
