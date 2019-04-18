import React, { Component } from "react";
import firebase from "../../firebase";
import AvatarEditor from "react-avatar-editor";
import {
  Grid,
  Header,
  Icon,
  Dropdown,
  Image,
  Modal,
  Input,
  Button
} from "semantic-ui-react";

class UserPanel extends Component {
  state = {
    user: this.props.currentUser,
    modal: false,
    previewImage: "",
    croppedImage: "",
    uploadCroppedImage: "",
    blob: "",
    storageRef: firebase.storage().ref(),
    userRef: firebase.auth().currentUser,
    usersRef: firebase.database().ref("user"),
    metadata: {
      contentType: "image/jpeg"
    }
  };
  openModal = () => {
    this.setState({ modal: true });
  };
  closeModal = () => {
    this.setState({ modal: false });
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
      text: <span onClick={this.openModal}> Change Avatar </span>
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

  handleChange = event => {
    const file = event.target.files[0];
    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener("load", () => {
        this.setState({ previewImage: reader.result });
      });
    }
  };
  handleCroppedImage = () => {
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
        let imageUrl = URL.createObjectURL(blob);
        this.setState({
          croppedImage: imageUrl,
          blob
        });
      });
    }
  };

  uploadCroppedimage = () => {
    const { storageRef, userRef, blob, metadata } = this.state;
    storageRef
      .child(`avatars/user-${userRef.uid}`)
      .put(blob, metadata)
      .then(snap => {
        snap.ref.getDownloadURL().then(downloadURL => {
          this.setState({ uploadCroppedImage: downloadURL }, () =>
            this.changeAvatar()
          );
        });
      });
  };
  changeAvatar = () => {
    this.state.userRef
      .updateProfile({
        photoURL: this.state.uploadCroppedImage
      })
      .then(() => {
        console.log("Photo Url updated");
        this.closeModal();
      })
      .catch(err => {
        console.error(err);
      });

    this.state.usersRef
      .child(this.state.user.uid)
      .update({ avatar: this.state.uploadCroppedImage })
      .then(() => {
        console.log("Avatar updated");
      })
      .catch(err => console.error(err));
  };
  render() {
    return (
      <Grid style={{ background: this.props.primaryColor }}>
        <Grid.Column>
          <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
            {/* app Header */}
            <Header inverted floated="left" as="h3">
              <Icon name="facebook messenger" />
              <Header.Content> Chat - App </Header.Content>
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
          {/* change user avatar modal */}
          <Modal basic open={this.state.modal} onClose={this.closeModal}>
            <Modal.Header>Change Avatar</Modal.Header>
            <Modal.Content>
              <Input
                onChange={this.handleChange}
                fluid
                type="file"
                label="New Avatar"
                name="previewImage"
              />
              <Grid centered stackable columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">
                    {this.state.previewImage && (
                      <AvatarEditor
                        ref={node => (this.avatarEditor = node)}
                        image={this.state.previewImage}
                        width={150}
                        height={150}
                        scale={1.2}
                        border={50}
                      />
                    )}
                  </Grid.Column>
                  <Grid.Column>
                    {/* cropped image preview */}
                    {this.state.croppedImage && (
                      <Image
                        style={{ margin: "3.5em auto" }}
                        width={130}
                        height={130}
                        src={this.state.croppedImage}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              {this.state.croppedImage && (
                <Button
                  color="green"
                  inverted
                  onClick={this.uploadCroppedimage}
                >
                  <Icon name="save outline" />
                  Change Avatar
                </Button>
              )}
              <Button color="blue" inverted onClick={this.handleCroppedImage}>
                <Icon name="image outline" />
                Preview
              </Button>
              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove" />
                Cancel
              </Button>
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
    );
  }
}
export default UserPanel;
