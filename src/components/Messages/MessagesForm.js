import React, { Component } from "react";
import firebase from "../../firebase";
import uuidv4 from "uuid/v4";
import { Segment, Input, Button } from "semantic-ui-react";

import FileModal from "./FileModal";

export default class MessagesForm extends Component {
  state = {
    storageRef: firebase.storage().ref(),
    uploadTask: null,
    uploadState: "",
    percentUploaded: 0,
    message: "",
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    loading: false,
    errors: [],
    modal: false
  };

  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });

  changeHandeler = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  createMessage = (fileurl = null) => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL
      }
    };
    if (fileurl !== null) {
      message["image"] = fileurl;
    } else {
      message["content"] = this.state.message;
    }
    return message;
  };
  sendMessage = () => {
    const { messagesRef } = this.props;
    const { message, channel } = this.state;

    if (message) {
      // send message
      this.setState({ loading: true });
      messagesRef
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: "", errors: [] });
        })
        .catch(err => {
          console.log(err);
          this.setState({
            loading: false,
            errors: this.state.errors.concat([err])
          });
        });
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: "Add A Message" })
      });
    }
  };

  uploadFile = (file, metadata) => {
    const pathToUpload = this.state.channel.id;
    const ref = this.props.messagesRef;

    const filepath = `chat/public/${uuidv4()}.jpg`;

    this.setState(
      {
        uploadState: "uploading",
        uploadTask: this.state.storageRef.child(filepath).put(file, metadata)
      },
      () => {
        this.state.uploadTask.on(
          "state_changed",
          snap => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            this.setState({ percentUploaded });
          },
          err => {
            console.error(err);
            this.setState({
              errors: this.state.errors.concat(err),
              uploadState: "error",
              uploadTask: null
            });
          },
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then(downloadurl => {
                this.sendFileMessage(downloadurl, ref, pathToUpload);
              })
              .catch(err => {
                console.error(err);
                this.setState({
                  errors: this.state.errors.concat(err),
                  uploadState: "error",
                  uploadTask: null
                });
              });
          }
        );
      }
    );
  };

  sendFileMessage = (fileurl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(fileurl))
      .then(() => {
        this.setState({
          uploadState: "done"
        });
      })
      .catch(err => {
        console.error(err);
        this.setState({
          errors: this.state.errors.concat(err)
        });
      });
  };

  render() {
    const { errors, message, loading, modal } = this.state;
    return (
      <Segment className="message__form">
        <Input
          fluid
          name="message"
          onChange={this.changeHandeler}
          value={message}
          style={{ marginBottom: "0.5em" }}
          label={<Button icon={"add"} />}
          labelPosition="left"
          className={
            errors.some(error => error.message.includes("message"))
              ? "error"
              : ""
          }
          placeholder="Write Your Message"
        />
        <Button.Group icon widths="2">
          <Button
            onClick={this.sendMessage}
            disabled={loading}
            color="blue"
            content="Send"
            labelPosition="left"
            icon="reply"
          />
          <Button
            color="green"
            onClick={this.openModal}
            content="Upload"
            labelPosition="right"
            icon="cloud upload"
          />
          <FileModal
            modal={modal}
            closeModal={this.closeModal}
            uploadFile={this.uploadFile}
          />
        </Button.Group>
      </Segment>
    );
  }
}
