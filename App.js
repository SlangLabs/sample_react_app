/**
 * Sample React Native App to demonstrate Slang integration
 * https://github.com/SlangLabs/sample_react_app
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {NativeEventEmitter, NativeModules, Platform, StyleSheet, Text, View} from 'react-native';

const { SlangBuddy } = NativeModules;

var slangEmitter;

type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = { 
      intent: "unknown",
      unresolvedEntity: "unknown",
      resolvedEntity: "unknown",
    };
  }

  componentDidMount() {
    slangEmitter = new NativeEventEmitter(SlangBuddy);
    // Initialize Slang. This is using the same AirtelMock credentials as in
    // https://github.com/SlangLabs/airtelmock
    SlangBuddy.initialize(
      "968fd6e6b1a347beb7b21b966f6b3c9d", 
      "c80525dd5fa146d6a3a1aba91fc5d6b9",
      () => {
        console.log("initialized slang ");
        console.log("registering actions ");
        // Slang has been successfully initialized. Register envets to handle the 
        // detected intents
        this.registerHandlers();
      },
      (reason) => {
        console.log("error initializing slang - " + reason);
      }
    );
  }

  registerHandlers() {
    // Register handler for the "romaing" intent
    slangEmitter.addListener('roaming', (e: Event) => {
      console.log(e);
      continueSession = true;
      this.setState({intent: null, intent: e.intent.name});
      // handle event.
      switch (e.eventType) {
        case "unresolvedEntity":
          // This is to handle a missing entity in the original utterance of the user
          this.setState({unresolvedEntity: e.unresolvedEntity.name});
          // If the user is looking for a domestic roaming, no need to ask for country. Implicitly set it to India
          if (e.unresolvedEntity.name === "country" && e.entities["region"].value === "domestic") {
            console.log("setting entity country");
            // This is used to force a value for an entity
            SlangBuddy.setEntity("country", "india");
          }
          break;

        case "action":
          // The intent is fully resolved at this point. Take some action
          break;
      }

      // The Slang session is suspended by default. Explicitly either mark it successful or failed
      if (continueSession) {
        console.log("continuing session...");
        SlangBuddy.continueSession();
      } else {
        console.log("failing session...");
        SlangBuddy.failSession(); 
      }
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to Slang React Native Demo!</Text>
        <Text style={styles.instructions}>To get started, click on the speaker icon and start talking</Text>
        <Text/>
        <Text style={styles.instructions}>Current intent: {this.state.intent}</Text>
        <Text style={styles.instructions}>Current unresolved entity: {this.state.unresolvedEntity}</Text>
        <Text style={styles.instructions}>Current resolved entity: {this.state.resolvedEntity}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
