import React, { Component } from "react";
import firebase from "../../firebase";
import uuidv4 from "uuid/v4";
import { Segment, Input, Button, IconGroup } from "semantic-ui-react";
import { Picker, emojiIndex } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";

export default class MessagesForm extends Component {
  state = {
    storageRef: firebase.storage().ref(),
    typingRef: firebase.database().ref("typing"),
    uploadTask: null,
    uploadState: "",
    percentUploaded: 0,
    message: "",
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    loading: false,
    errors: [],
    modal: false,
    emojiPicker: false
  };

  componentWillUnmount() {
    if(this.state.uploadTask !== null){
      this.state.uploadTask.Cancel();
      this.setState({ uploadTask: null });
    }
  }

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
    const { getMessagesRef } = this.props;
    const { message, channel, user, typingRef } = this.state;

    if (message) {
      // send message
      this.setState({ loading: true });
      getMessagesRef()
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: "", errors: [] });
          typingRef
            .child(channel.id)
            .child(user.uid)
            .remove();
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
  getPath = () => {
    if (this.props.isPrivateChannel) {
      return `chat/private-${this.state.channel.id}`;
    } else {
      return "chat/public";
    }
  };
  uploadFile = (file, metadata) => {
    const pathToUpload = this.state.channel.id;
    const ref = this.props.getMessagesRef();

    const filepath = `${this.getPath()}/${uuidv4()}.jpg`;

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
            this.props.isProgressBarVisible(percentUploaded);
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

  handleKeyDown = event => {
    if (event.keyCode === 13) {
      this.sendMessage();
    }
    const { message, typingRef, channel, user } = this.state;
    if (message) {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .set(user.displayName);
    } else {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .remove();
    }
  };

  handletogglePicker = () => {
    this.setState({ emojiPicker: !this.state.emojiPicker });
  };
  handleAddEmoji = emoji => {
    const oldMessage = this.state.message;
    const newMessage = this.colonToUnicode(` ${oldMessage} ${emoji.colons} `);
    this.setState({ message: newMessage, emojiPicker: false });
    setTimeout(() => this.messageInputRef.focus(), 0);
  };

  colonToUnicode = message => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
      x = x.replace(/:/g, "");
      let emoji = emojiIndex.emojis[x];
      if (typeof emoji !== "undefined") {
        let unicode = emoji.native;

        if (unicode !== "undefined") {
          return unicode;
        }
      }
      x = ":" + x + ":";
      return x;
    });
  };

  render() {
    const {
      errors,
      message,
      loading,
      modal,
      uploadState,
      percentUploaded,
      emojiPicker
    } = this.state;
    return (
      <Segment className="message__form">
        {emojiPicker && (
          <Picker
            set="facebook"
            onSelect={this.handleAddEmoji}
            className="emojipicker"
            title="Pick Your Emoji"
            emoji="point_up"
          />
        )}
        <Input
          fluid
          name="message"
          onChange={this.changeHandeler}
          onKeyDown={this.handleKeyDown}
          value={message}
          ref={node => (this.messageInputRef = node)}
          style={{ marginBottom: "0.5em" }}
          label={
            <Button
              icon={emojiPicker ? "close" : "add"}
              content={emojiPicker ? "Close" : null}
              onClick={this.handletogglePicker}
            />
          }
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
            disabled={uploadState === "uploading"}
            onClick={this.openModal}
            content="Upload"
            labelPosition="right"
            icon="cloud upload"
          />
        </Button.Group>
        <FileModal
          modal={modal}
          closeModal={this.closeModal}
          uploadFile={this.uploadFile}
        />
        <ProgressBar
          uploadState={uploadState}
          percentUploaded={percentUploaded}
        />
      </Segment>
    );
  }
}
